import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://oyfearfdtyfqlvoxixpi.supabase.co',
  'sb_publishable_WjFfVN6IpnYSdlfVmoX5rg_BTRf0Ax5'
);
const visitorKey = 'kamorale-visitor-id';
let visitorId = localStorage.getItem(visitorKey);
if (!visitorId) {
  visitorId = crypto.randomUUID();
  localStorage.setItem(visitorKey, visitorId);
}
const $ = id => document.getElementById(id);
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function publicUrl(photo) {
  return photo.image_url || (photo.image_path
    ? supabase.storage.from('site-media').getPublicUrl(photo.image_path).data.publicUrl
    : '');
}

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url || '');
}

function makeSocialActions(photo) {
  const actions = element('div', 'photo-social-actions');
  const react = element('button', 'photo-react', '♥ React');
  react.type = 'button';
  react.setAttribute('aria-pressed', 'false');
  const reactionCount = element('span', 'photo-social-count', 'Loading reactions…');
  const viewCount = element('span', 'photo-social-count photo-view-count', 'Loading views…');
  actions.append(react, reactionCount, viewCount);

  const photoId = String(photo.id);
  react.addEventListener('click', async () => {
    react.disabled = true;
    const { data: mine, error: lookupError } = await supabase
      .from('photo_reactions')
      .select('id')
      .eq('photo_id', photoId)
      .eq('visitor_id', visitorId)
      .maybeSingle();
    if (lookupError) {
      reactionCount.textContent = 'Reactions unavailable';
      react.disabled = false;
      return;
    }

    const result = mine
      ? await supabase.from('photo_reactions').delete().eq('photo_id', photoId).eq('visitor_id', visitorId)
      : await supabase.from('photo_reactions').insert({ photo_id: photoId, visitor_id: visitorId });
    if (result.error) reactionCount.textContent = 'Reactions unavailable';
    else await refreshReactions(photoId, reactionCount, react);
    react.disabled = false;
  });

  void recordView(photoId, viewCount);
  void refreshReactions(photoId, reactionCount, react);
  return actions;
}

async function refreshReactions(photoId, countLabel, button) {
  const [{ count, error }, { data: mine, error: mineError }] = await Promise.all([
    supabase.from('photo_reactions').select('*', { count: 'exact', head: true }).eq('photo_id', photoId),
    supabase.from('photo_reactions').select('id').eq('photo_id', photoId).eq('visitor_id', visitorId).maybeSingle()
  ]);
  if (error || mineError) {
    countLabel.textContent = 'Reactions unavailable';
    return;
  }
  countLabel.textContent = `${count || 0} ${count === 1 ? 'reaction' : 'reactions'}`;
  button.classList.toggle('is-reacted', !!mine);
  button.setAttribute('aria-pressed', String(!!mine));
  button.textContent = mine ? '♥ Reacted' : '♥ React';
}

async function recordView(photoId, label) {
  const { error: insertError } = await supabase
    .from('photo_views')
    .insert({ photo_id: photoId, visitor_id: visitorId });
  // A visitor contributes one view per photo; duplicate visits are expected.
  if (insertError && insertError.code !== '23505') {
    label.textContent = 'Views unavailable';
    return;
  }
  const { count, error } = await supabase
    .from('photo_views')
    .select('*', { count: 'exact', head: true })
    .eq('photo_id', photoId);
  label.textContent = error ? 'Views unavailable' : `${count || 0} ${count === 1 ? 'view' : 'views'}`;
  label.title = 'Unique visitor views';
}

async function start() {
  const grid = $('gallery');
  try {
    const { data, error } = await supabase.from('photos').select('*').eq('published', true).order('created_at', { ascending: false });
    if (error) throw error;
    grid.replaceChildren();
    if (!data?.length) {
      grid.append(element('p', 'empty', 'No photos or videos published yet. Check back soon.'));
      return;
    }

    for (const photo of data) {
      const card = element('figure', 'photo-card');
      const url = publicUrl(photo);
      if (url) {
        const media = element(isVideo(url) ? 'video' : 'img');
        media.src = url;
        if (media.tagName === 'VIDEO') {
          media.controls = true;
          media.preload = 'metadata';
        } else {
          media.alt = photo.title || photo.caption || 'Island community photo';
          media.loading = 'lazy';
        }
        card.append(media);
      }
      card.append(element('figcaption', '', photo.title || photo.caption || 'Island moment'));
      if (photo.id != null) card.append(makeSocialActions(photo));
      grid.append(card);
    }
  } catch (error) {
    grid.replaceChildren(element('p', 'empty', 'The gallery is temporarily unavailable.'));
    $('error').hidden = false;
    $('error').textContent = error.message || 'Please try again later.';
  }
}

void start();
