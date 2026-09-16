# Rewrites plain markdown image references to site-root-relative /assets/images/
# paths so authors never have to hand-write baseurl handling or derived-image
# paths in post/page content. Runs at :pre_render, i.e. on the raw markdown
# source, before Liquid/kramdown convert it.
#
# ![alt](/assets/images/posts/slug/foo.jpg)
#   -> baseurl-corrected path to the auto-generated derived/display/ copy
#      (see _plugins/photos.rb for how that derivative is generated)
#
# ![alt](/assets/images/posts/slug/foo.jpg?full)
#   -> baseurl-corrected path to the original, full-resolution file
module ImageLinks
  IMAGE_REF = %r{
    (!\[[^\]]*\]\()
    (/assets/images/(?!derived/)[^)\s]+?)
    (\?(?:full|original))?
    (\))
  }x.freeze

  def self.rewrite(content, baseurl)
    content.gsub(IMAGE_REF) do
      prefix, path, full_flag, suffix = $1, $2, $3, $4
      resolved = full_flag ? path : path.sub("/assets/images/", "/assets/images/derived/display/")
      "#{prefix}#{baseurl}#{resolved}#{suffix}"
    end
  end
end

# Registering on both :documents and :pages is necessary to cover top-level
# Jekyll::Page objects (e.g. index.md) as well as collection documents (posts,
# and the custom "pages" collection) — but because that collection is itself
# named "pages", its documents match *both* owners, so :pre_render fires twice
# for the same object. Guard against reprocessing so a ?full/?original flag
# (already stripped after the first pass) doesn't get silently reinterpreted
# as an unprocessed default path on the second.
Jekyll::Hooks.register([:documents, :pages], :pre_render) do |doc|
  next if doc.instance_variable_defined?(:@image_links_done)

  doc.content = ImageLinks.rewrite(doc.content, doc.site.config["baseurl"].to_s)
  doc.instance_variable_set(:@image_links_done, true)
end
