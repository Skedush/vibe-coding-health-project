import { Routes, Route } from 'react-router-dom'
import routes from './routes'

function App() {
  return (
    <Routes>
      {routes.map((route) =>
        route.redirect ? (
          <Route key={route.path} path={route.path} element={<Navigate to={route.redirect} replace />} />
        ) : route.wrapper ? (
          <Route key={route.path} path={route.path} element={
            <route.wrapper>
              <route.component />
            </route.wrapper>
          } />
        ) : (
          <Route key={route.path} path={route.path} element={<route.component />} />
        )
      )}
    </Routes>
  )
}

export default App
