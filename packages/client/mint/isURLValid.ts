const isURLValid = (url: string) => {
  const hostname = new URL(url).hostname;
  return hostname.includes('replicate.delivery');
};

export default isURLValid;
