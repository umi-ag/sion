export const getUrlHash = () => {
  const urlFragment = window.location.hash.substring(1);
  return urlFragment;
};

export const removeUrlHash = () => {
  // remove URL fragment
  window.history.replaceState(null, '', window.location.pathname);
};
