import React, { useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords, image }) => {
    const { company } = useCompany();

    const siteTitle = title ? `${title} - ${company.name}` : company.name;
    const siteDescription = description || 'Aplikasi solusi kebersihan, pengelolaan, dan penjemputan sampah cerdas.';

    useEffect(() => {
        // 1. Update Document Title
        document.title = siteTitle;

        // 2. Helper to manage Meta tags
        const updateMetaTag = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let meta = document.querySelector(`meta[${attr}="${name}"]`);

            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attr, name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // Update standard tags
        updateMetaTag('description', siteDescription);
        updateMetaTag('keywords', keywords || 'kebersihan, sampah, daur ulang, penjemputan sampah, resik, lingkungan');

        // Update Open Graph tags
        updateMetaTag('og:title', siteTitle, true);
        updateMetaTag('og:description', siteDescription, true);
        updateMetaTag('og:type', 'website', true);
        if (image) {
            updateMetaTag('og:image', image, true);
        }
    }, [siteTitle, siteDescription, keywords, image]);

    return null;
};

export default SEO;
