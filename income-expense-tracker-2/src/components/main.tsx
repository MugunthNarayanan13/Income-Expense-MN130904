import React, { ReactNode } from 'react';

interface MainProps {
  children: ReactNode;
}

const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <main className="flex-1 p-4 flex justify-center items-center">
      {children}
    </main>
  );
};

export default Main;