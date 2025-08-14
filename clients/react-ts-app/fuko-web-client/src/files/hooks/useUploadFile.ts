import { useCallback, useRef, useState } from "react"
import { uploadFileRequest } from "../internal/api/fileApi";
import { useAuthContext } from "../../auth/AuthContext";



export function useUploaderFile() {
    const [state, setState] = useState<"not started" | "in progress" | "completed" | "error">("not started");
    const createdToken = useRef<string | null>(null);

    const { getAccessToken } = useAuthContext();

    const upload = useCallback((file: File, isPrivate: boolean): Promise<string | null> => {
        setState("in progress");
        const accessToken = getAccessToken();
        if (!accessToken) {
            setState("error");
            return Promise.resolve(null);
        }
        return uploadFileRequest(file, isPrivate, accessToken)
            .then((token) => {
                createdToken.current = token;
                setState("completed");
                return token;
            })
            .catch(() => {
                setState("error");
                return null;
            });
    }, [getAccessToken]);

    return { upload, state, createdToken };
}