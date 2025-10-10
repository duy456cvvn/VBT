use chrono::{DateTime, Utc};
use std::fmt::Write;

pub struct Channel {
    title: String,
    link: String,
    description: String,
    image: Option<Image>,
    pub_date: DateTime<Utc>,
    last_build_date: DateTime<Utc>,
    items: Vec<Item>,
}

pub struct Image {
    url: String,
    title: String,
    link: String,
}

pub struct Item {
    title: String,
    link: String,
    description: String,
    enclosure: Option<Enclosure>,
    guid: String,
    pub_date: DateTime<Utc>,
}

pub struct Enclosure {
    url: String,
    length: u64,
    mime_type: String,
}

impl Channel {
    pub fn new(
        title: impl Into<String>,
        link: impl Into<String>,
        description: impl Into<String>,
    ) -> Self {
        let now = Utc::now();
        Self {
            title: title.into(),
            link: link.into(),
            description: description.into(),
            image: None,
            pub_date: now,
            last_build_date: now,
            items: Vec::new(),
        }
    }

    pub fn image(
        mut self,
        url: impl Into<String>,
        title: impl Into<String>,
        link: impl Into<String>,
    ) -> Self {
        self.image = Some(Image {
            url: url.into(),
            title: title.into(),
            link: link.into(),
        });
        self
    }

    pub fn pub_date(mut self, date: DateTime<Utc>) -> Self {
        self.pub_date = date;
        self
    }

    pub fn last_build_date(mut self, date: DateTime<Utc>) -> Self {
        self.last_build_date = date;
        self
    }

    pub fn item(mut self, item: Item) -> Self {
        self.items.push(item);
        self
    }

    /// Add multiple items to the channel
    pub fn items(mut self, items: impl IntoIterator<Item = Item>) -> Self {
        self.items.extend(items);
        self
    }

    pub fn build(self) -> Result<String, std::fmt::Error> {
        let mut rss = String::with_capacity(self.items.len() * 500 + 500);

        writeln!(rss, r#"<?xml version="1.0" encoding="UTF-8"?>"#)?;
        writeln!(rss, r#"<rss version="2.0">"#)?;
        writeln!(rss, "<channel>")?;
        writeln!(rss, "     <title>{}</title>", escape_xml(&self.title))?;
        writeln!(rss, "     <link>{}</link>", escape_xml(&self.link))?;
        writeln!(
            rss,
            "     <description>{}</description>",
            escape_xml(&self.description)
        )?;

        if let Some(image) = &self.image {
            writeln!(rss, "     <image>")?;
            writeln!(rss, "         <url>{}</url>", escape_xml(&image.url))?;
            writeln!(rss, "         <title>{}</title>", escape_xml(&image.title))?;
            writeln!(rss, "         <link>{}</link>", escape_xml(&image.link))?;
            writeln!(rss, "     </image>")?;
        }

        writeln!(
            rss,
            "     <pubDate>{}</pubDate>",
            self.pub_date.to_rfc2822()
        )?;
        writeln!(
            rss,
            "     <lastBuildDate>{}</lastBuildDate>",
            self.last_build_date.to_rfc2822()
        )?;

        for item in &self.items {
            writeln!(rss, "     <item>")?;
            writeln!(rss, "         <title>{}</title>", escape_xml(&item.title))?;
            writeln!(rss, "         <link>{}</link>", escape_xml(&item.link))?;
            writeln!(
                rss,
                "         <description>{}</description>",
                escape_xml(&item.description)
            )?;

            if let Some(enclosure) = &item.enclosure {
                writeln!(
                    rss,
                    r#"     <enclosure url="{}" length="{}" type="{}"></enclosure>"#,
                    escape_xml(&enclosure.url),
                    enclosure.length,
                    escape_xml(&enclosure.mime_type)
                )?;
            }
            writeln!(rss, "     <guid>{}</guid>", escape_xml(&item.guid))?;
            writeln!(rss, "     <pubDate>{}</pubDate", escape_xml(&item.pub_date))?;
            writeln!(rss, "     </item>")?;
        }

        writeln!(rss, "</channel>")?;
        writeln!(rss, "</rss>")?;

        Ok(rss)
    }

    /// Write rss to a writer
    pub fn write_to<W: std::io::Write>(self, writer: &mut W) -> std::io::Result<()> {
        let rss = self
            .build()
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        writer.write_all(rss.as_bytes())
    }

    /// Save the RSS to a file
    pub fn save_to_file(self, path: impl AsRef<std::path::Path>) -> std::io::Result<()> {
        let path = path.as_ref();

        // Create parent directories if they don't exist
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let rss = self
            .build()
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        std::fs::write(path, rss)
    }
}

impl Item {
    pub fn new(
        title: impl Into<String>,
        link: impl Into<String>,
        description: impl Into<String>,
        guid: impl Into<String>,
    ) -> Self {
        Self {
            title: title.into(),
            link: link.into(),
            description: description.into(),
            enclosure: None,
            guid: guid.into(),
            pub_date: Utc::now(),
        }
    }

    pub fn enclosure(
        mut self,
        url: impl Into<String>,
        length: u64,
        mime_type: impl Into<String>,
    ) -> Self {
        self.enclosure = Some(Enclosure {
            url: url.into(),
            length,
            mime_type: mime_type.into(),
        });
        self
    }
    pub fn pub_date(mut self, date: DateTime<Utc>) -> Self {
        self.pub_date = date;
        self
    }
}

fn escape_xml<T: ToString>(s: T) -> String {
    s.to_string()
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_rss() {
        let channel =
            Channel::new("Test Channel", "https://example.com", "A test channel").item(Item::new(
                "Test Item",
                "https://example.com/item",
                "Test description",
                "unique-id-123",
            ));

        let rss = channel.build().unwrap();
        assert!(rss.contains("<title>Test Channel</title>"));
        assert!(rss.contains("<title>Test Item</title>"));
    }

    #[test]
    fn test_xml_escaping() {
        let result = escape_xml("Test & <test> \"quoted\"");
        assert_eq!(result, "Test &amp; &lt;test&gt; &quot;quoted&quot;");
    }
}
