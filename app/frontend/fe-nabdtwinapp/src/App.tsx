import { RouterProvider} from 'react-router-dom';
import router from "./services/router.tsx";
import { Toaster } from "./externaluicomponents/sonner";

function App() {

  return (
      <>
          <RouterProvider router={router} />
          <Toaster />
      </>
  )
}

export default App
