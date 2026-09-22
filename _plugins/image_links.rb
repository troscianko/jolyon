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
#
# ![alt](/assets/images/posts/slug/foo.jpg?width=400)
#   -> constrains the displayed image to 400px wide (append % for a percentage,
#      e.g. ?width=50%). Combine flags with &, e.g. ?full&width=400. This sets
#      max-width directly on the <img> via a kramdown IAL, so it also works for
#      a linked image ([![alt](foo.jpg?width=400)](https://example.com)) — see
#      assets/js/lightbox.js, which mirrors the same value onto the figure it
#      creates for the (non-linked) click-to-enlarge case, so the caption
#      background matches the image's width instead of staying full column width.
#
# To make an image a plain clickable link instead of the click-to-enlarge
# lightbox, wrap it in standard markdown link syntax: [![alt](foo.jpg)](url) —
# lightbox.js skips any image already inside an <a>.
module ImageLinks
  IMAGE_REF = %r{
    (!\[[^\]]*\]\()
    (/assets/images/(?!derived/)[^)\s?]+)
    (?:\?([^)\s]*))?
    \s*
    (\))
  }x.freeze

  def self.parse_flags(raw_query)
    return {} unless raw_query

    raw_query.split("&").each_with_object({}) do |pair, flags|
      key, value = pair.split("=", 2)
      next if key.nil? || key.empty?

      flags[key] = value.nil? ? true : value
    end
  end

  def self.width_style(value)
    value = value.to_s
    css_value = value.end_with?("%") ? value : "#{value}px"
    %({: style="max-width:#{css_value}"})
  end

  def self.rewrite(content, baseurl)
    content.gsub(IMAGE_REF) do
      prefix, path, raw_query, suffix = $1, $2, $3, $4
      flags = parse_flags(raw_query)

      full = flags["full"] || flags["original"]
      resolved = full ? path : path.sub("/assets/images/", "/assets/images/derived/display/")
      ial = flags["width"] ? width_style(flags["width"]) : ""

      "#{prefix}#{baseurl}#{resolved}#{suffix}#{ial}"
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
