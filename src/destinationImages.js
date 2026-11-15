
export const DEFAULT_IMAGE = "/images/defaultimage.jpg";

export const DESTINATIONS = [
  {
    name: "Bali",
    country: "Indonesia",
    tag: "TROPICAL PARADISE",
    image:
      "/images/bali.jpg",
  },
  {
    name: "Kyoto",
    country: "Japan",
    tag: "CULTURE & HERITAGE",
    image:
      "/images/kyoto.jpg",
  },
  {
    name: "Swiss Alps",
    country: "Switzerland",
    tag: "MOUNTAIN ESCAPE",
    image:
      "/images/swiss.jpg",
  },
  {
    name: "Jaipur",
    country: "India",
    tag: "ROYAL HERITAGE",
    image:
      "/images/jaipur.jpg",
  },
  {
    name: "Delhi",
    country: "India",
    tag: "CAPITAL CULTURE",
    image:
      "/images/delhi.jpg",
  },
  {
    name: "Himachal Pradesh",
    country: "India",
    tag: "HIMALAYAN ESCAPE",
    image:
      "/images/himachal.jpg",
  },
];

// Add your own cities here. Aliases help when someone types 'Manali' instead
// of 'Himachal Pradesh'. Unknown destinations use DEFAULT_IMAGE.
export const DESTINATION_ALIASES = {
  manali: "Himachal Pradesh",
  shimla: "Himachal Pradesh",
  kasol: "Himachal Pradesh",
  "new delhi": "Delhi",
  amer: "Jaipur",
};

export function getDestinationImage(destination = "") {
  const query = String(destination).trim().toLowerCase();
  if (!query) return DEFAULT_IMAGE;
  const key = Object.keys(DESTINATION_ALIASES).find(
    (k) => query === k || query.startsWith(k + ","),
  );
  const target = (key ? DESTINATION_ALIASES[key] : query).toLowerCase();
  const found = DESTINATIONS.find(
    (d) =>
      target === d.name.toLowerCase() ||
      target.startsWith(d.name.toLowerCase() + ",") ||
      target.startsWith(d.name.toLowerCase() + " "),
  );
  return found?.image || DEFAULT_IMAGE;
}
