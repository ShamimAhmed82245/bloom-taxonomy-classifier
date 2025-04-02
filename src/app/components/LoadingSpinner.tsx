import React from "react";
import { ClipLoader } from "react-spinners";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <ClipLoader color="#3B82F6" size={24} />
    </div>
  );
};

export default LoadingSpinner;
