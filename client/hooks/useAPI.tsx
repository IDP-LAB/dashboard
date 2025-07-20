import { APIContext } from "@/providers/api";
import { useContext } from "react";

export function useAPI() {
  const context = useContext(APIContext);
  if (!context)
    throw new Error("useAPI deve ser usado dentro de um APIProvider");

  return context;
}
