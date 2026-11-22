import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://oyfearfdtyfqlvoxixpi.supabase.co',
  'sb_publishable_WjFfVN6IpnYSdlfVmoX5rg_BTRf0Ax5'
);
const target = document.getElementById('featured');
const hero = document.getElementById('home-hero');
const slideLayers = hero ? [...hero.querySelectorAll('.hero-slide')] : [];

function photoUrl(photo) {
  return photo?.image_url || (photo?.image_path
    ? supabase.storage.from('site-media').getPublicUrl(photo.image_path).data.publicUrl
    : '');
}

function showMessage(message) {
  const p = document.createElement('p');
  p.className = 'featured-status';
  p.textContent = message;
  target.replaceChildren(p);
}

function preload(url) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(url);
    image.onerror = () => resolve('');
    image.src = url;
  });
}

async function renderSlideshow(selectedPhotos, latestPhotos) {
  if (!slideLayers.length) return;
  // Use admin-selected photos when available; otherwise rotate the newest five.
  const chosen = selectedPhotos.length ? selectedPhotos : latestPhotos;
  const otherPhotos = selectedPhotos.length ? latestPhotos : [];
  const seen = new Set();
  const candidates = [...chosen, ...otherPhotos].filter(photo => {
    const url = photoUrl(photo);
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
  const urls = (await Promise.all(candidates.map(photo => preload(photoUrl(photo))))).filter(Boolean);
  if (!urls.length) return;

  let activeLayer = 0;
  let current = 0;
  slideLayers[0].style.backgroundImage = `url("${urls[0]}")`;
  slideLayers[0].classList.add('is-active');
  if (urls.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.setInterval(() => {
    const nextLayer = 1 - activeLayer;
    current = (current + 1) % urls.length;
    slideLayers[nextLayer].style.backgroundImage = `url("${urls[current]}")`;
    slideLayers[nextLayer].classList.add('is-active');
    slideLayers[activeLayer].classList.remove('is-active');
    activeLayer = nextLayer;
  }, 6500);
}

try {
  const [selectedResult, latestResult] = await Promise.all([
    supabase.from('photos').select('title,caption,image_url,image_path,headline,created_at').eq('published', true).eq('headline', true).order('created_at', { ascending: false }).limit(10),
    supabase.from('photos').select('title,caption,image_url,image_path,created_at').eq('published', true).order('created_at', { ascending: false }).limit(5)
  ]);
  if (selectedResult.error) throw selectedResult.error;
  if (latestResult.error) throw latestResult.error;

  const selectedPhotos = selectedResult.data || [];
  const latestPhotos = latestResult.data || [];
  await renderSlideshow(selectedPhotos, latestPhotos);

  const photo = latestPhotos[0];
  const imageUrl = photoUrl(photo);
  if (!photo || !imageUrl) {
    showMessage('No published photo is available yet. Publish a photo from Admin to feature it here.');
  } else {
    const card = document.createElement('article');
    card.className = 'featured-photo';
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = photo.title || photo.caption || 'Featured island photo';
    image.loading = 'lazy';
    image.onerror = () => showMessage('The photo could not be loaded. Check that its image file is available in the site-media bucket.');
    const title = document.createElement('h3');
    title.textContent = photo.title || 'Island moment';
    const more = document.createElement('a');
    more.href = './gallery.html#gallery';
    more.textContent = 'Click to read more';
    card.append(image, title, more);
    target.replaceChildren(card);
  }
} catch (error) {
  console.error('Unable to load homepage photos:', error);
  showMessage('The latest photo could not be loaded. Check the Supabase content policies and schema, then try again.');
}
