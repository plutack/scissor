import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

interface ApiResponse {
  success: boolean;
  message: string;
}

interface CustomToastProps {
  response: ApiResponse;
}

export const CustomToast: React.FC<CustomToastProps> = ({ response }) => {
  const { toast } = useToast();

  const showToast = React.useCallback(() => {
    toast({
      variant: response.success ? "default" : "destructive",
      title: response.success ? "Success" : "Error",
      description: response.message,
    });
  }, [response, toast]);

  React.useEffect(() => {
    showToast();
  }, [showToast]);

  return (
    <ToastProvider>
      <Toast>
        <ToastTitle>{response.success ? "Success" : "Error"}</ToastTitle>
        <ToastDescription>{response.message}</ToastDescription>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
};

// Usage in a component
// import React, { useState } from 'react';
// import { CustomToast } from './CustomToast';

// export const ApiCallComponent: React.FC = () => {
//   const [response, setResponse] = useState<ApiResponse | null>(null);

//   const makeApiCall = async () => {
//     try {
//       const res = await fetch('your-api-endpoint');
//       const data: ApiResponse = await res.json();
//       setResponse(data);
//     } catch (error) {
//       setResponse({ 
//         success: false, 
//         message: "An unexpected error occurred" 
//       });
//     }
//   };

//   return (
//     <div>
//       <button onClick={makeApiCall}>Make API Call</button>
//       {response && <CustomToast response={response} />}
//     </div>
//   );
// };