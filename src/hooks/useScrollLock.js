import { useEffect } from 'react';

export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      // Salva la posizione corrente dello scroll
      const scrollY = window.scrollY;
      
      // Blocca lo scroll del body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
      
      // Aggiungi classe per disabilitare le animazioni
      document.body.classList.add('scroll-locked');
      
      // Funzione per ripristinare lo scroll
      const restoreScroll = () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.classList.remove('scroll-locked');
        window.scrollTo(0, scrollY);
      };
      
      // Restore scroll quando il modal si chiude
      return restoreScroll;
    }
  }, [isLocked]);
}; 