import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PublicLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar />
            <main className="flex-grow pb-16 md:pb-0">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
