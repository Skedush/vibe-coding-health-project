import { Routes, Route, Navigate } from 'react-router-dom'
import routes from './routes'

function App() {
  return (
    <Routes>
      {routes.map((route) =>
        route.redirect ? (
          <Route key={route.path} path={route.path} element={<Navigate to={route.redirect} replace />} />
        ) : route.component ? (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.wrapper ? (
                <route.wrapper>
                  <route.component />
                </route.wrapper>
              ) : (
                <route.component />
              )
            }
          />
        ) : null
      )}
    </Routes>
  )
}

export default App
