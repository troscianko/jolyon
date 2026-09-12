require "yaml"
require "mini_magick"

# Indexes every image under assets/images/, pairing each with an optional sidecar
# <name>.md (same directory, same basename) for title/excerpt/caption metadata, and
# generates resized "thumb" (grid) and "display" (hero/lightbox) derivatives.
#
# Runs twice, deliberately:
#   - :after_reset, i.e. before Jekyll scans the source tree for static files, so any
#     derivative files written here get picked up as ordinary static files with no
#     extra registration.
#   - :post_read, because Jekyll's own data reader does `site.data = DataReader...read`
#     (a full reassignment, not a merge) during `read` — which runs after :after_reset
#     and would wipe out the "photos"/"photo_dirs" keys we set there. Re-running after
#     `read` completes puts them back; the derivative-file generation is a cheap no-op
#     the second time thanks to the mtime check.
module Photos
  IMAGE_EXT = /\.(jpe?g|png|gif|webp)\z/i.freeze
  FRONT_MATTER_REGEXP = /\A(---\s*\n.*?\n?)^(---\s*$\n?)/m.freeze
  SIZES = { "thumb" => 600, "display" => 1920 }.freeze

  def self.run(site)
    images_root = File.join(site.source, "assets", "images")
    return unless Dir.exist?(images_root)

    site.data["photos"] = {}
    site.data["photo_dirs"] = {}

    Dir.glob(File.join(images_root, "**", "*")).each do |abs_path|
      next unless File.file?(abs_path)
      next unless abs_path =~ IMAGE_EXT
      next if abs_path.include?("#{File::SEPARATOR}derived#{File::SEPARATOR}")

      web_path = "/" + abs_path.sub("#{site.source}/", "")
      dir_web_path = File.dirname(web_path)

      (site.data["photo_dirs"][dir_web_path] ||= []) << web_path

      sidecar = abs_path.sub(IMAGE_EXT, ".md")
      if File.exist?(sidecar)
        meta = parse_sidecar(site, sidecar)
        site.data["photos"][web_path] = meta if meta
      end

      generate_derivatives(site, abs_path, web_path)
    end

    site.data["photo_dirs"].each_value(&:sort!)
  end

  def self.parse_sidecar(site, path)
    content = File.read(path)
    match = content.match(FRONT_MATTER_REGEXP)
    return nil unless match

    front_matter = YAML.safe_load(match[1], permitted_classes: [Date], aliases: true) || {}
    body = content[match.end(0)..].to_s.strip

    converter = site.find_converter_instance(Jekyll::Converters::Markdown)
    {
      "title" => front_matter["title"],
      "excerpt" => front_matter["excerpt"],
      "themes" => front_matter["themes"] || [],
      "caption_html" => body.empty? ? nil : converter.convert(body),
    }
  rescue StandardError => e
    Jekyll.logger.warn "photos:", "couldn't parse #{path}: #{e.message}"
    nil
  end

  def self.generate_derivatives(site, abs_path, web_path)
    SIZES.each do |name, max_width|
      dest_web = web_path.sub("/assets/images/", "/assets/images/derived/#{name}/")
      dest_abs = File.join(site.source, dest_web)

      next if File.exist?(dest_abs) && File.mtime(dest_abs) >= File.mtime(abs_path)

      begin
        FileUtils.mkdir_p(File.dirname(dest_abs))
        image = MiniMagick::Image.open(abs_path)
        image.combine_options do |c|
          c.auto_orient
          c.resize "#{max_width}x#{max_width}>"
          c.quality "82"
          c.strip
        end
        image.write(dest_abs)
      rescue StandardError => e
        Jekyll.logger.warn "photos:", "couldn't resize #{abs_path}: #{e.message}"
      end
    end
  end
end

Jekyll::Hooks.register(:site, :after_reset) do |site|
  Photos.run(site)
end

Jekyll::Hooks.register(:site, :post_read) do |site|
  Photos.run(site)
end
