import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://oyfearfdtyfqlvoxixpi.supabase.co',
  'sb_publishable_WjFfVN6IpnYSdlfVmoX5rg_BTRf0Ax5'
);
const target = document.getElementById('featured');

function showMessage(message) {
  const p = document.createElement('p');
  p.className = 'featured-status';
  p.textContent = message;
  target.replaceChildren(p);
}

try {
  // Use the newest published photo; it doesn't need a separate homepage flag.
  const { data, error } = await supabase
    .from('photos')
    .select('id,title,caption,image_url,image_path,created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;

  const photo = data?.[0];
  const imageUrl = photo?.image_url || (photo?.image_path
    ? supabase.storage.from('site-media').getPublicUrl(photo.image_path).data.publicUrl
    : '');
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
  console.error('Unable to load homepage photo:', error);
  showMessage('The latest photo could not be loaded. Check the Supabase content policies and try again.');
}
