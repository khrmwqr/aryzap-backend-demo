const fetch = require('node-fetch');

const baseURL = `${process.env.BASE_URL}`;

// Define your endpoints to test
const endpoints = [
  // 1. Ads Manager
  { id: 1, url: '/api/ads/', description: 'Retrieves all Ads Manager entries' },
  { id: 2, url: '/api/ads/652fc2f1e1c5d3abf2004587', description: 'Retrieves a specific Ads Manager entry by its ID' },

  // 2. Age Ratings
  { id: 3, url: '/api/ageratings/', description: 'Retrieves all age rating entries' },
  { id: 4, url: '/api/ageratings/64f378c11408c28bd7f2cbc2', description: 'Retrieves a specific age rating entry by its ID' },

  // 3. Apps
  { id: 5, url: '/api/apps/', description: 'Retrieves all apps' },
  { id: 6, url: '/api/apps/64f32277f40bd7df2e7e67d4', description: 'Retrieves a specific app by its ID' },

  // 4. Billings
  { id: 7, url: '/api/billings/', description: 'Retrieves all billing records' },
  { id: 8, url: '/api/billings/658c19e6b114edc303b679cb', description: 'Retrieves a specific billing record by its ID' },

  // 5. Categories
  { id: 9, url: '/api/categories/', description: 'Retrieves all categories' },
  { id: 10, url: '/api/categories/bkend', description: 'Retrieves all categories for backend processing' },
  { id: 11, url: '/api/categories/65e08605c3eef14817fe0be7', description: 'Retrieves a specific category by its ID' },

  // 6. CDN
  { id: 12, url: '/api/cdn/', description: 'Retrieves all CDN episodes' },
  { id: 13, url: '/api/cdn/66e2caf47ca3c4d15e87656d', description: 'Retrieves CDN episodes associated with a specific series ID' },
  { id: 14, url: '/api/cdn/ep/67597f183f442cfddb82864d', description: 'Retrieves a specific CDN episode by its episode ID' },

  // 7. Cron Jobs
  { id: 15, url: '/api/cron-jobs/', description: 'Retrieves all cron jobs' },
  { id: 16, url: '/api/cjobs/', description: 'Retrieves all cron jobs' },
  { id: 17, url: '/api/cjobs/get-all/652fc2f1e1c5d3abf2004587', description: 'Retrieves all cron job data for the specified job ID' },

  // 8. Display Ads
  { id: 18, url: '/api/dads/', description: 'Retrieves all display ads' },
  { id: 19, url: '/api/dads/67617cdbd4459571a9a5df49', description: 'Retrieves a specific display ad by its ID' },

  // 9. DM (Fetch/Store Episodes)
  { id: 20, url: '/api/dm/676d6878998bb1e06d5aad28/x5o0em/1/10', description: 'Fetch and store episodes for a specific series, playlist, and paginated request' },
  { id: 21, url: '/api/dm/676d6878998bb1e06d5aad28', description: 'Fetch episodes by series ID' },
  { id: 22, url: '/api/dm/pg/676d6878998bb1e06d5aad28', description: 'Fetch episodes by series ID with pagination' },
  { id: 23, url: '/api/dm/', description: 'Fetch all episodes' },

  // 10. Episodes
  { id: 24, url: '/api/episodes/', description: 'Retrieves all episodes' },
  { id: 25, url: '/api/episodes/676d6878998bb1e06d5aad28', description: 'Retrieves episodes for a specific series by its ID' },
  { id: 26, url: '/api/episodes/byCatID/65e5cd2bae40996d9ad03876', description: 'Retrieves all episodes by a specific category ID' },
  { id: 27, url: '/api/episodes/byCatID/65e5cd2bae40996d9ad03876/PK', description: 'Retrieves all episodes by a specific category ID and a custom parameter (:cn)' },
  { id: 28, url: '/api/episodes/byCatIDInt/65e5cd2bae40996d9ad03876', description: 'Retrieves all series by a specific category ID (possibly internal logic)' },

  // 11. Favorites
  { id: 29, url: '/api/fav/user/5KIL1O54AxUZ8121jOV0XhvBlVy1', description: 'Retrieves all favorite items for a specific user by user ID' },
  { id: 30, url: '/api/fav/66ed61b48f0d1f1dee7de0cd', description: 'Retrieves a specific favorite item by its ID' },

  // 12. Feedback
  { id: 31, url: '/api/feedback/user/5KIL1O54AxUZ8121jOV0XhvBlVy1', description: 'Retrieves all feedback items for a specific user' },
  { id: 32, url: '/api/feedback/', description: 'Retrieves all feedback items' },

  // 13. Genres
  { id: 33, url: '/api/genres/', description: 'Retrieves all genres' },
  { id: 34, url: '/api/genres/64f373fa0b5df297f83569c1', description: 'Retrieves a specific genre by its ID' },
  { id: 35, url: '/api/genres/genreid/64f373fa0b5df297f83569c1', description: 'Retrieves series associated with a specific genre ID' },
  { id: 36, url: '/api/genres/all/64f373fa0b5df297f83569c1', description: 'Retrieves all series associated with a given genre ID' },
  { id: 37, url: '/api/genres/genreid/pg/64f373fa0b5df297f83569c1', description: 'Retrieves series associated with a specific genre ID with pagination' },

  // 14. Geo Policies
  { id: 38, url: '/api/geo/', description: 'Retrieves all geo policies' },
  { id: 39, url: '/api/geo/6527d0e05dcc5b439e151273', description: 'Retrieves a specific geo policy by its ID' },

  // 15. YouTube (YT)
  { id: 40, url: '/api/yt/getLoc', description: 'Retrieves location-related data for YT episodes' },
  { id: 41, url: '/api/yt/get/PLb2aaNHUy_gGncDVeyjNzfpPqNA_Uz0-X&ab_channel=ARYDigitalHD/676d6878998bb1e06d5aad28', description: 'Retrieves YT episodes for the given playlist ID and series ID' },
  { id: 42, url: '/api/yt/', description: 'Retrieves all YT episodes' },
  { id: 43, url: '/api/yt/676d6878998bb1e06d5aad28', description: 'Retrieves YT episodes by a specific series ID' },
  { id: 44, url: '/api/yt/video/676d68984663daf0cd92e8fb', description: 'Retrieves a specific YT episode by its episode ID' },
  { id: 45, url: '/api/yt/pg/676d6878998bb1e06d5aad28', description: 'Retrieves YT episodes by series ID with pagination' },

  // 16. Home
  { id: 46, url: '/api/home/', description: 'Retrieves all home entries' },
  { id: 47, url: '/api/home/v2', description: 'Retrieves all home entries in a version 2 format' },
  { id: 48, url: '/api/home/65e872557e1dd46ad2a4ffcc', description: 'Retrieves a specific home entry by its ID' },

  // 17. Home V2
  { id: 49, url: '/api/homev2/', description: 'Retrieves all home entries (version 2 structure)' },
  { id: 50, url: '/api/homev2/v2', description: 'Retrieves a specialized or alternative version of the home entries' },
  { id: 51, url: '/api/homev2/669f5e353fe1bf91a6a4e273', description: 'Retrieves a specific home entry by its ID' },
  { id: 52, url: '/api/homev2/669f5e353fe1bf91a6a4e273/PK', description: 'Retrieves a specific home entry by its ID with an additional parameter (:cn)' },

  // 18. Packages
  { id: 53, url: '/api/packages/', description: 'Retrieves all packages' },
  { id: 54, url: '/api/packages/658ebcf0a3998ca3629d6860', description: 'Retrieves a specific package by its ID' },

  // 19. Promotional Banners (PB)
  { id: 55, url: '/api/pb/', description: 'Retrieves all promotional banners' },
  { id: 56, url: '/api/pb/66c4972145109fe26176423d', description: 'Retrieves a specific promotional banner by its ID' },

  // 20. Ratings
  { id: 57, url: '/api/ratings/user/5KIL1O54AxUZ8121jOV0XhvBlVy1', description: 'Retrieves all ratings for a specific user' },
  { id: 58, url: '/api/ratings/user/5KIL1O54AxUZ8121jOV0XhvBlVy1/66ab43998039b6d052c92a40', description: 'Retrieves the rating(s) for a user, filtered by the specified series ID' },

  // 21. Search
  { id: 59, url: '/api/search/kabhi', description: 'Performs a search operation with the provided search ID' },
  { id: 60, url: '/api/search/cast/adeel', description: 'Performs a search operation by cast ID' },

  // 22. Series
  { id: 61, url: '/api/series/', description: 'Retrieves all series' },
  { id: 62, url: '/api/series/sergen', description: 'Retrieves all series with their associated genres' },
  { id: 63, url: '/api/series/652fc2f1e1c5d3abf2004587', description: 'Retrieves a specific series by its ID' },
  { id: 64, url: '/api/series/byCatID/65e5cd2bae40996d9ad03876', description: 'Retrieves all series by a specific category ID' },
  { id: 65, url: '/api/series/byCatID/65e5cd2bae40996d9ad03876/PK', description: 'Retrieves all series by category ID with an additional parameter (:cn)' },
  { id: 66, url: '/api/series/byCatID/pg/65e5cd2bae40996d9ad03876/PK', description: 'Retrieves all series by category ID with pagination or additional parameter usage' },
  { id: 67, url: '/api/series/byCatIDInt/65e5cd2bae40996d9ad03876', description: 'Retrieves all series by a specific category ID (possibly using internal logic)' },
  { id: 68, url: '/api/series/getCount/65e5cd2bae40996d9ad03876', description: 'Retrieves the count of series under a specific category ID' },
  { id: 69, url: '/api/series/getCountbyGenre/64f374825813b7bff6cbd804', description: 'Retrieves the count of series by genre ID' },

  // 23. Slider
  { id: 70, url: '/api/slider/', description: 'Retrieves all slider entries' },
  { id: 71, url: '/api/slider/669a3fb500af0bd132ffe26d', description: 'Retrieves a specific slider entry by its ID' },

  // 24. Subscriptions
  { id: 72, url: '/api/subscriptions/', description: 'Retrieves all subscriptions' },
  { id: 73, url: '/api/subscriptions/662a290dfb6d357f6417f59e', description: 'Retrieves a specific subscription by its ID' },

  // 25. Users
  { id: 74, url: '/api/users/getAllUsers', description: 'Retrieves all users' },
  { id: 75, url: '/api/users/653a6d2828896e6943c143da', description: 'Retrieves a specific user by their ID' },
  { id: 76, url: '/api/users/md5/12345', description: 'Generates an MD5 hash of the provided password' },
  { id: 77, url: '/api/subuser/658bfc9e3967217171171823', description: 'Retrieves a specific subscriber user by their ID' },

  // 26. VOD (Video On Demand)
  { id: 78, url: '/api/vod/', description: 'Retrieves all VOD contents' },
  { id: 79, url: '/api/vod/652fa4922a459bc53fef0dfb', description: 'Retrieves a specific VOD content by its ID' }
];


async function testAllEndpoints(req, res) {
  const testResults = [];

  for (const { id, url, description } of endpoints) {
    try {
      const response = await fetch(`${baseURL}${url}`);
      testResults.push({
        id: id,
        endpoint: url,
        description,
        status: response.status,
        passed: response.ok
      });
    } catch (error) {
      testResults.push({
        id: id,
        endpoint: url,
        description,
        status: 'Network error',
        passed: false
      });
    }
  }

  // Calculate summary
  const totalAPIs = testResults.length;
  const passedAPIs = testResults.filter((api) => api.passed).length;
  const failedAPIs = totalAPIs - passedAPIs;

  return res.json({
    totalAPIs,
    passedAPIs,
    failedAPIs,
    results: testResults,
  });
}

module.exports = { testAllEndpoints };
