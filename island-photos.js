import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://oyfearfdtyfqlvoxixpi.supabase.co',
  'sb_publishable_WjFfVN6IpnYSdlfVmoX5rg_BTRf0Ax5'
);

function imageUrl(photo) {
  return photo.image_url || (photo.image_path
    ? supabase.storage.from('site-media').getPublicUrl(photo.image_path).data.publicUrl
    : '');
}

try {
  const { data, error } = await supabase
    .from('photos')
    .select('title,topic,caption,image_url,image_path,created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;

  for (const card of document.querySelectorAll('[data-island]')) {
    const island = card.dataset.island.toLocaleLowerCase();
    const photo = (data || []).find(item => (item.topic || '').trim().toLocaleLowerCase() === island && imageUrl(item));
    if (!photo) continue;
    const link = document.createElement('a');
    link.className = 'island-photo-link';
    link.href = './gallery.html#gallery';
    const image = document.createElement('img');
    image.className = 'island-photo';
    image.src = imageUrl(photo);
    image.alt = photo.title || photo.caption || `${card.dataset.island} island photo`;
    image.loading = 'lazy';
    link.append(image);
    card.append(link);
  }
} catch (error) {
  console.error('Unable to load island photos:', error);
  const message = document.createElement('p');
  message.className = 'island-photo-status';
  message.textContent = 'Island photos are temporarily unavailable.';
  document.getElementById('island-grid')?.prepend(message);
}
