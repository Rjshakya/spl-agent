import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/index";
import { TamboProvider } from "@/providers/tambo-provider";

export function App() {
  return (
    <TamboProvider>
      <RouterProvider router={router} />
    </TamboProvider>
  );
}

export default App;
