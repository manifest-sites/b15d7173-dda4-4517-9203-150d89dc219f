import { createEntityClient } from "../utils/entityWrapper";
import schema from "./Animal.json";
export const Animal = createEntityClient("Animal", schema);
