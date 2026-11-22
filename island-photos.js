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

  const photos = data || [];

  for (const card of document.querySelectorAll('[data-island]')) {
    const island = card.dataset.island.toLocaleLowerCase();
    const islandPhotos = photos
      .filter(item => (item.topic || '').trim().toLocaleLowerCase() === island)
      .map(item => ({
        url: imageUrl(item),
        alt: item.title || item.caption || `${card.dataset.island} island photo`
      }))
      .filter(photo => photo.url);

    if (!islandPhotos.length) continue;

    const cover = card.querySelector('.state-cover');
    const link = document.createElement('a');
    link.className = 'island-photo-link';
    link.href = './gallery.html#gallery';

    const image = document.createElement('img');
    image.className = 'island-photo';
    image.alt = islandPhotos[0].alt;
    image.loading = 'lazy';

    Promise.all(islandPhotos.map(photo => new Promise(resolve => {
      const preload = new Image();
      preload.onload = () => resolve(photo);
      preload.onerror = () => resolve(null);
      preload.src = photo.url;
    }))).then(loaded => {
      const validPhotos = loaded.filter(Boolean);
      if (!validPhotos.length) return;

      let current = 0;
      image.src = validPhotos[current].url;
      image.alt = validPhotos[current].alt;

      if (validPhotos.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.setInterval(() => {
          current = (current + 1) % validPhotos.length;
          image.style.opacity = '0';
          window.setTimeout(() => {
            image.src = validPhotos[current].url;
            image.alt = validPhotos[current].alt;
            image.style.opacity = '1';
          }, 250);
        }, 5500);
      }
    });

    link.append(image);
    if (cover) cover.append(link);
    else card.append(link);
  }
} catch (error) {
  console.error('Unable to load island photos:', error);
  const message = document.createElement('p');
  message.className = 'island-photo-status';
  message.textContent = 'Island photos are temporarily unavailable.';
  document.getElementById('island-grid')?.prepend(message);
}
