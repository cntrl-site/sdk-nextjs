import { createContext } from "react";
import { ItemGeometryService } from "./ItemGeometryService";

export const ItemGeometryContext = createContext(new ItemGeometryService());
