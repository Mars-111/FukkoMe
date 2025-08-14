
type UniversalErrorProps = {
    errorCode: number;  
    errorHeader?: string;
    errorDescription?: string;
};

type ErrorData = {
    title: string;
    description: string;
};

const errorsData: Map<number, ErrorData> = new Map([
    [404, { title: "Not Found", description: "The requested resource was not found." }],
    [500, { title: "Internal Server Error", description: "An unexpected error occurred." }],
]);

export default function UniversalError({errorCode, errorHeader, errorDescription}: UniversalErrorProps) {
    const errorData = errorsData.get(errorCode);
    return (
        <div>
            <h1>{errorCode}</h1>
            <h2>{errorHeader || errorData?.title || "Error"}</h2>
            <p>{errorDescription || errorData?.description || "An unexpected error occurred."}</p>
        </div>
    );
}