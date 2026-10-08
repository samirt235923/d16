export function markdownToHtml(markdown: string) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  const inline = (value: string) =>
    value
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/_([^_]+)_/g, "<em>$1</em>");
  const output: string[] = [];
  let list: "ul" | "ol" | null = null;
  const closeList = () => {
    if (list) output.push(`</${list}>`);
    list = null;
  };
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (heading) {
      closeList();
      output.push(
        `<h${heading[1].length}>${inline(escapeHtml(heading[2]))}</h${heading[1].length}>`,
      );
    } else if (bullet || numbered) {
      const nextList = bullet ? "ul" : "ol";
      if (list !== nextList) {
        closeList();
        list = nextList;
        output.push(`<${list}>`);
      }
      output.push(`<li>${inline(escapeHtml((bullet ?? numbered)?.[1] ?? ""))}</li>`);
    } else if (line.startsWith("> ")) {
      closeList();
      output.push(`<blockquote>${inline(escapeHtml(line.slice(2)))}</blockquote>`);
    } else {
      closeList();
      output.push(`<p>${inline(escapeHtml(line))}</p>`);
    }
  }
  closeList();
  return output.join("");
}