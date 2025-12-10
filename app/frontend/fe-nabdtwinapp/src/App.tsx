import { RouterProvider} from 'react-router-dom';
import router from "./services/routing/router.tsx";
import {ToastContainer} from "react-toastify";
function App() {

  return (
      <>
          <RouterProvider router={router} />
          <ToastContainer />
      </>
  )
}

export default App
