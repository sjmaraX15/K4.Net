import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://oyfearfdtyfqlvoxixpi.supabase.co',
  'sb_publishable_WjFfVN6IpnYSdlfVmoX5rg_BTRf0Ax5'
);

function photoUrl(photo) {
  return photo?.image_url || (photo?.image_path
    ? supabase.storage.from('site-media').getPublicUrl(photo.image_path).data.publicUrl
    : '');
}

const hero = document.getElementById('home-hero');
const target = document.getElementById('featured');

try {
  const [heroResult, latestResult] = await Promise.all([
    supabase.from('photos').select('title,caption,image_url,image_path,created_at').eq('published', true).eq('hero_background', true).order('created_at', { ascending: false }).limit(1),
    supabase.from('photos').select('title,caption,image_url,image_path,created_at').eq('published', true).order('created_at', { ascending: false }).limit(1)
  ]);

  if (heroResult.error) throw heroResult.error;
  if (latestResult.error) throw latestResult.error;

  const heroPhoto = heroResult.data?.[0];
  const heroUrl = photoUrl(heroPhoto);
  if (heroUrl && hero) hero.style.backgroundImage = `url("${heroUrl}")`;

  const photo = latestResult.data?.[0];
  const imageUrl = photoUrl(photo);
  if (!photo || !imageUrl) {
    target.replaceChildren(Object.assign(document.createElement('p'), { className: 'featured-status', textContent: 'No published photo is available yet. Publish a photo from Admin to feature it here.' }));
  } else {
    const card = document.createElement('article');
    card.className = 'featured-photo';
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = photo.title || photo.caption || 'Featured island photo';
    image.loading = 'lazy';
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
  target.replaceChildren(Object.assign(document.createElement('p'), { className: 'featured-status', textContent: 'The latest photo could not be loaded.' }));
}
