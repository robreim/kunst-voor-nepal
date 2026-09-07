// Decap CMS preview for "artworks": fitted photo + title (the form beside it
// already shows all other fields). Decap's default shows the photo at full
// natural size, which overflows the pane for big files.
(function () {
  if (!window.CMS || !window.createClass || !window.h) return;
  var s = {
    padding: '24px',
    maxWidth: '480px',
    margin: '0 auto',
    textAlign: 'center',
    fontFamily: "'Source Serif 4', Georgia, serif",
  };
  s.img = {
    display: 'block',
    maxWidth: '100%',
    maxHeight: '50vh',
    width: 'auto',
    height: 'auto',
    margin: '0 auto 16px',
  };
  s.title = { fontFamily: "'Fraunces', Georgia, serif", fontWeight: 800, fontSize: '28px', margin: 0 };

  var ArtworkPreview = window.createClass({
    render: function () {
      var data = this.props.entry.get('data');
      var image = data.get('image') ? this.props.getAsset(data.get('image')) : null;
      var title = data.get('title') || '(zonder titel)';
      return window.h('div', { style: s },
        image
          ? window.h('img', { src: image.toString(), style: s.img, alt: title })
          : window.h('p', {}, 'Geen foto gekozen'),
        window.h('h1', { style: s.title }, title)
      );
    },
  });
  window.CMS.registerPreviewTemplate('artworks', ArtworkPreview);
})();
