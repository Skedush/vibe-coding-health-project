"""
全局异常处理模块
"""
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import JWTError
from sqlalchemy.exc import SQLAlchemyError
import logging

# 配置日志
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class AppException(Exception):
    """
    应用自定义异常基类
    """
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    """
    资源未找到异常
    """
    def __init__(self, message: str = "资源未找到"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class UnauthorizedException(AppException):
    """
    未授权异常
    """
    def __init__(self, message: str = "未授权访问"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(AppException):
    """
    禁止访问异常
    """
    def __init__(self, message: str = "禁止访问"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)


class ValidationException(AppException):
    """
    验证异常
    """
    def __init__(self, message: str = "数据验证失败"):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY)


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    """
    全局异常处理中间件
    """
    
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except AppException as e:
            logger.error(f"应用异常: {e.message}")
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.message}
            )
        except ValueError as e:
            logger.error(f"值错误: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": str(e)}
            )
        except RequestValidationError as e:
            logger.error(f"验证错误: {str(e)}")
            errors = []
            for error in e.errors():
                field = ".".join(str(x) for x in error["loc"])
                message = error["msg"]
                errors.append(f"{field}: {message}")
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={"detail": ", ".join(errors)}
            )
        except JWTError as e:
            logger.error(f"JWT错误: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Token验证失败"}
            )
        except SQLAlchemyError as e:
            logger.error(f"数据库错误: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "数据库操作失败"}
            )
        except Exception as e:
            logger.error(f"未知异常: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "服务器内部错误"}
            )


def setup_exception_handlers(app):
    """
    配置异常处理器
    """
    app.add_middleware(ExceptionHandlerMiddleware)