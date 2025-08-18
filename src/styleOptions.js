// styleOptions.js

export const STYLE_OPTIONS = [
  {
    id: 'funko',
    name: 'Funko Pop Style',
    prompt: `Using the attached photo as reference, create a full‑body, 
            Funko Pop–style illustration of only the person in the image.
             Render the figure with the signature Funko Pop proportions 
             (oversized head, simplified features, vinyl‑figure look, objects—just 
             the person), no background, and no additional characters or objects—just 
             the person from the photo,head to toe, centered in the frame.`,
    image: 'https://genplay-studio-3d.onrender.com/images/funko-pop-sample.png'
  },
  {
    id: 'outline',
    name: 'Outline Art',
    prompt: 'Convert the provided image into a clean black line art illustration, with sharp outlines, no shading or colors, minimal white background.',
    image: '/images/clean-vector-line-art.png'
  },
  {
    id: 'other',
    name: 'Other Styles',
    prompt: '',
    description: 'Coming soon',
    image: null
  }
  // Add more styles here as needed
]; 