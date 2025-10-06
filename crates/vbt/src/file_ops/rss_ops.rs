use crate::{
    types::{book::BookRow, watchlist::WatchlistEntry},
    utils::{
        cache::{generate_cache_key, load_cache, save_cache},
        url::get_mime_type,
    },
};
use chrono::{DateTime, Utc};
use rss::write::{Channel, Item};
use std::collections::HashSet;

pub fn generate_and_save_rss(
    books: &[BookRow],
    watchlist_entry: &WatchlistEntry,
    output_path: impl AsRef<std::path::Path>,
) -> Result<(), String> {
    let now = Utc::now();
    let mut cache = load_cache::<String>("date_cache.json");

    let new_titles: HashSet<_> = books
        .iter()
        .map(|book| generate_cache_key(book))
        .filter(|key| !cache.data.contains_key(key))
        .collect();

    let title_build_date: DateTime<Utc> = if !new_titles.is_empty() {
        cache
            .title_build_date
            .insert(watchlist_entry.name.clone(), now.to_rfc2822());
        now
    } else {
        cache
            .title_build_date
            .get(&watchlist_entry.name)
            .and_then(|s| DateTime::parse_from_rfc2822(s).ok())
            .map(|d| d.with_timezone(&Utc))
            .unwrap_or(now)
    };

    let alt_titles = {
        let mut titles: Vec<_> = watchlist_entry
            .other
            .iter()
            .map(|(_, value)| value.to_string())
            .collect();
        titles.sort();
        titles.join(", ")
    };

    let mut channel = Channel::new(
        &watchlist_entry.name,
        "https://github.com/Irilith/VBT",
        format!("VBT feed for: {}", watchlist_entry.name),
    )
    .image(
        &watchlist_entry.cover,
        &watchlist_entry.name,
        "https://github.com/Irilith/VBT",
    )
    .pub_date(now)
    .last_build_date(title_build_date);

    for book in books {
        let cache_key = generate_cache_key(book);
        let mime_type = get_mime_type(&watchlist_entry.cover);
        // let pub_date = cache.data.entry(cache_key).or_insert(now).clone();

        let pub_date_str = cache
            .data
            .entry(cache_key)
            .or_insert(now.to_rfc2822())
            .clone();
        let pub_date = DateTime::parse_from_rfc2822(&pub_date_str)
            .unwrap()
            .with_timezone(&Utc);

        let item = Item::new(
            &book.title,
            "https://github.com/Irilith/VBT",
            format!(
                "Author: {} | Translator: {} | ISBN: {} | Alternative Titles: {}",
                book.author, book.translator, book.isbn, alt_titles
            ),
            format!(
                "https://ppdvn.gov.vn/web/guest/ke-hoach-xuat-ban?query={}",
                book.title.trim_end().replace(" ", "+")
            ),
        )
        .enclosure(&watchlist_entry.cover, 0, mime_type)
        .pub_date(pub_date);

        channel = channel.item(item);
    }

    if let Err(e) = save_cache(&cache, "date_cache.json") {
        eprintln!("Failed to save date cache: {}", e);
    }

    channel
        .save_to_file(output_path)
        .map_err(|e| format!("Failed to save RSS: {}", e))
}
