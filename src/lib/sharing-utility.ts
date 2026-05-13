/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const shareToWhatsApp = async (dataUrl: string, caption: string) => {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'benefit-card.jpg', { type: 'image/jpeg' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Kumbara-Kala Digital Card',
        text: caption,
      });
      return true;
    } else {
      // Fallback: Download the file and provide WhatsApp link instructions
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'kumbara-kala-card.jpg';
      link.click();
      
      // Open WhatsApp with text (files must be attached manually in web fallback)
      const encodedText = encodeURIComponent(caption);
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
      return false;
    }
  } catch (error) {
    console.error('Sharing failed', error);
    return false;
  }
};
