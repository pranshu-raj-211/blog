export const SITE = {
  website: "https://blog.pranshu-raj.me/", // replace this with your deployed domain
  author: "Pranshu Raj",
  profile: "https://pranshu-raj.me/",
  desc: "Pranshu's Blog.",
  title: "Systems & Sidequests",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "Suggest Changes",
    url: "https://github.com/pranshu-raj-211/blog/",
  },
  dynamicOgImage: true,
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Kolkata", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
