import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/images/logo_sistem.png"
            alt="Logo Sistem"
            style={{ width: '300px', height: 'auto', objectFit: 'contain', maxWidth: '300px', maxHeight: '100px', imageRendering: 'crisp-edges' }}
        />
    );
}
