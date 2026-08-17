import toast from "react-hot-toast";

export const showSuccessToast = (message: string) => {
    toast.success(message, {
        duration: 3000,
        style: { 
            background: "#4caf50", 
            color: "#fff" 
        }
    });
};

export const showErrorToast = (message: string) => {
    toast.error(message, {
        duration: 3000,
        style: { 
            background: "#d32f2f", 
            color: "#fff" 
        }
    });
};

export const showLoadingToast = (message: string) => {
    return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
    toast.dismiss(toastId);
};
