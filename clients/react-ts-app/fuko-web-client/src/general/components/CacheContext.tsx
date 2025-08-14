// import { createContext, useContext, type ReactNode } from "react";
// import type { ChildrenType } from "../models/ChildrenType";
// import { FileCache } from "../../files/fileCache";

// type CacheContextType = {
//     userCache: UserCache;
//     fileCache: FileCache;
// };


// const CacheContext = createContext<CacheContextType | undefined>(undefined);

// export const useCache = () => {
//     const context = useContext(CacheContext);
//     if (context === undefined) {
//         throw new Error("useCache must be used within a CacheProvider");
//     }
//     return context;
// };

// export const CacheProvider = ({ children }: ChildrenType): ReactNode => {
//     const userCache = new UserCache();
//     const fileCache = new FileCache();

//     return (
//         <CacheContext.Provider value={{ userCache, fileCache } as CacheContextType}>
//             {children}
//         </CacheContext.Provider>
//     );
// }
