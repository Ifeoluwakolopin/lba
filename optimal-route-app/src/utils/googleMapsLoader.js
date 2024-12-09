const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

let loadingPromise = null;

export const loadGoogleMaps = () => {
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    // Create script element with proper async loading
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker&loading=async`;
    script.async = true;

    script.addEventListener("load", () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps failed to load"));
      }
    });

    script.addEventListener("error", (error) => {
      reject(new Error("Google Maps script failed to load"));
    });

    document.head.appendChild(script);
  });

  return loadingPromise;
};
