import { RouterProvider } from "react-router";
import { router } from "@/routes/index.js";
import { TamboProvider } from "@/providers/tambo-provider.js";

export function App() {
  return (
    <TamboProvider>
      <RouterProvider router={router} />
    </TamboProvider>
  );
}

export default App;
