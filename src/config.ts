/** Single source of truth for site-wide configuration. */
export const SITE = {
  name: "LunexCorp",
  url: "https://lunexcorp.org",
  email: "lunex.corpofficial@gmail.com",
  githubOwner: "LunexCorp-Official",
  githubUrl: "https://github.com/LunexCorp-Official",
  /** Flagship product repository. Its source is private and is never listed or linked. */
  flagshipRepo: "Lucif",
};

/** Repositories never shown in the directory (case-insensitive). */
export const EXCLUDED_REPOS = [SITE.flagshipRepo.toLowerCase()];

export const WHATSAPP = {
  display: "063 154 5556",
  international: "+27 63 154 5556",
  digits: "27631545556",
  channelUrl: "https://whatsapp.com/channel/0029Vaoqu5Z7YScx7tMKPb2s",
};
export const waLink = (text = "") =>
  `https://wa.me/${WHATSAPP.digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const DEMO_LIMIT = 5;
