const mockDB = {
  productions: [
    {
      id: 1,
      type: "movie",
      title: "The Dark Knight",
      slug: "the-dark-knight",
      description: "Phim siêu anh hùng về Batman",
      poster_url:
        "https://upload.wikimedia.org/wikipedia/vi/2/2d/Poster_phim_K%E1%BB%B5_s%C4%A9_b%C3%B3ng_%C4%91%C3%AAm_2008.jpg",
      banner_url:
        "https://upload.wikimedia.org/wikipedia/vi/2/2d/Poster_phim_K%E1%BB%B5_s%C4%A9_b%C3%B3ng_%C4%91%C3%AAm_2008.jpg",
      status: "completed",
      release_year: 2008,
      is_premium: true,
      country: "USA",
      rating_avg: 5.0,
      rating_count: 1520,
      language: "English",
      created_at: "2026-01-22T00:36:26.000Z",
      updated_at: "2026-01-22T00:36:26.000Z",

      // Movie details (từ bảng movies)
      movie: {
        duration: 9120,
        preview_duration: 300,
      },

      // Actors (từ bảng production_actors và actors)
      actors: [
        {
          id: 1,
          name: "Tom Hanks",
          slug: "tom-hanks",
          avatar_url: "/actors/tom-hanks.jpg",
          bio: "Diễn viên Mỹ nổi tiếng",
          birth_date: "1956-07-09",
          country: "USA",
          gender: "male",
          character_name: "Bruce Wayne / Batman",
          role_type: "cast",
          is_main: true,
          display_order: 1,
        },
        {
          id: 2,
          name: "Leonardo DiCaprio",
          slug: "leonardo-dicaprio",
          avatar_url: "/actors/leonardo-dicaprio.jpg",
          bio: "Diễn viên Hollywood",
          birth_date: "1974-11-11",
          country: "USA",
          gender: "male",
          character_name: "Harvey Dent / Two-Face",
          role_type: "cast",
          is_main: true,
          display_order: 2,
        },
        {
          id: 3,
          name: "Meryl Streep",
          slug: "meryl-streep",
          avatar_url: "/actors/meryl-streep.jpg",
          bio: "Nữ diễn viên xuất sắc",
          birth_date: "1949-06-22",
          country: "USA",
          gender: "female",
          character_name: "Rachel Dawes",
          role_type: "cast",
          is_main: false,
          display_order: 3,
        },
      ],

      // Genres (từ bảng production_genres và genres)
      genres: [
        {
          id: 1,
          name: "Hành động",
          slug: "hanh-dong",
          description: "Phim hành động kịch tính",
        },
        {
          id: 15,
          name: "Siêu anh hùng",
          slug: "sieu-anh-hung",
          description: "Phim về siêu anh hùng",
        },
        {
          id: 18,
          name: "Bí ẩn",
          slug: "bi-an",
          description: "Phim bí ẩn hồi hộp",
        },
      ],

      // Episodes (từ bảng episodes)
      episodes: [
        {
          id: 1,
          episode_number: 1,
          title: "Full Movie",
          video_url: null,
          duration: 9120,
          thumbnail_url: "/thumbnails/dark-knight.jpg",
          intro_start: 90,
          intro_end: 150,
          preview_enabled: true,
          views_count: 5001,
          created_at: "2026-01-22T00:36:26.000Z",
          updated_at: "2026-01-22T00:36:26.000Z",
        },
      ],

      // Ratings (từ bảng ratings)
      ratings: [
        {
          user_id: 1,
          rating: 5,
          review_title: "Kiệt tác điện ảnh",
          review_content:
            "The Dark Knight là phim siêu anh hùng hay nhất mọi thời đại. Diễn xuất của Heath Ledger xuất sắc.",
          likes_count: 150,
          is_edited: false,
          created_at: "2026-01-22T00:36:26.000Z",
          updated_at: "2026-01-22T00:36:26.000Z",
          user: {
            id: 1,
            username: "admin",
            email: "admin@moviehub.com",
            avatar_url: "/avatars/admin.jpg",
            role: "admin",
          },
        },
        {
          user_id: 2,
          rating: 5,
          review_title: "Không thể chê vào đâu được",
          review_content: "Phim có plot tuyệt vời, diễn xuất đỉnh cao.",
          likes_count: 89,
          is_edited: false,
          created_at: "2026-01-22T00:36:26.000Z",
          updated_at: "2026-01-22T00:36:26.000Z",
          user: {
            id: 2,
            username: "john_doe",
            email: "john.doe@email.com",
            avatar_url: "/avatars/john.jpg",
            role: "user",
          },
        },
      ],

      // Comments (từ bảng comments)
      comments: [
        {
          id: 1,
          user_id: 1,
          production_id: 1,
          episode_id: null,
          content: "Phim này thực sự thay đổi cách nhìn về phim siêu anh hùng!",
          parent_id: null,
          likes_count: 50,
          status: "active",
          created_at: "2026-01-22T00:36:26.000Z",
          updated_at: "2026-01-22T00:36:26.000Z",
          user: {
            id: 1,
            username: "admin",
            avatar_url: "/avatars/admin.jpg",
          },
          replies: [
            {
              id: 2,
              user_id: 2,
              production_id: 1,
              episode_id: null,
              content: "Heath Ledger xứng đáng Oscar cho vai Joker!",
              parent_id: 1,
              likes_count: 30,
              status: "active",
              created_at: "2026-01-22T00:36:26.000Z",
              updated_at: "2026-01-22T00:36:26.000Z",
              user: {
                id: 2,
                username: "john_doe",
                avatar_url: "/avatars/john.jpg",
              },
            },
          ],
        },
      ],
    },

    {
      id: 2,
      type: "movie",
      title: "Inception",
      slug: "inception",
      description: "Phim hành động khoa học viễn tưởng",
      poster_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQYG1_0TZ5emr5ZCazTyMyDo1iiyy0hVqiVcvTtXFaq2sTV2g0BcS09PHXt2kRQLvHu27cO2HA4IHFARYYkESFdPQTmHwjzYmz0K-w3Qs&s=10",
      banner_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQYG1_0TZ5emr5ZCazTyMyDo1iiyy0hVqiVcvTtXFaq2sTV2g0BcS09PHXt2kRQLvHu27cO2HA4IHFARYYkESFdPQTmHwjzYmz0K-w3Qs&s=10",
      status: "completed",
      release_year: 2010,
      is_premium: true,
      country: "USA",
      rating_avg: 5.0,
      rating_count: 980,
      language: "English",
      created_at: "2026-01-22T00:36:26.000Z",
      updated_at: "2026-01-22T00:36:26.000Z",

      movie: {
        duration: 8880,
        preview_duration: 300,
      },

      actors: [
        {
          id: 2,
          name: "Leonardo DiCaprio",
          slug: "leonardo-dicaprio",
          avatar_url: "/actors/leonardo-dicaprio.jpg",
          bio: "Diễn viên Hollywood",
          birth_date: "1974-11-11",
          country: "USA",
          gender: "male",
          character_name: "Dom Cobb",
          role_type: "cast",
          is_main: true,
          display_order: 1,
        },
        {
          id: 5,
          name: "Jennifer Lawrence",
          slug: "jennifer-lawrence",
          avatar_url: "/actors/jennifer-lawrence.jpg",
          bio: "Nữ diễn viên trẻ tài năng",
          birth_date: "1990-08-15",
          country: "USA",
          gender: "female",
          character_name: "Ariadne",
          role_type: "cast",
          is_main: true,
          display_order: 2,
        },
      ],

      genres: [
        {
          id: 1,
          name: "Hành động",
          slug: "hanh-dong",
        },
        {
          id: 5,
          name: "Viễn tưởng",
          slug: "vien-tuong",
        },
        {
          id: 19,
          name: "Khoa học viễn tưởng",
          slug: "khoa-hoc-vien-tuong",
        },
      ],

      episodes: [
        {
          id: 2,
          episode_number: 1,
          title: "Full Movie",
          duration: 8880,
          thumbnail_url: "/thumbnails/inception.jpg",
          intro_start: 60,
          intro_end: 120,
          preview_enabled: true,
          views_count: 4501,
        },
      ],

      ratings: [
        {
          user_id: 2,
          rating: 5,
          review_title: "Đỉnh cao của Nolan",
          review_content:
            "Inception làm thay đổi cách làm phim khoa học viễn tưởng. Plot phức tạp nhưng hấp dẫn.",
          likes_count: 120,
          is_edited: false,
          user: {
            id: 2,
            username: "john_doe",
            avatar_url: "/avatars/john.jpg",
          },
        },
      ],

      comments: [
        {
          id: 3,
          user_id: 3,
          production_id: 2,
          episode_id: null,
          content: "Ai đã xem Inception hơn 3 lần để hiểu plot giơ tay?",
          parent_id: null,
          likes_count: 40,
          status: "active",
          user: {
            id: 3,
            username: "jane_smith",
            avatar_url: "/avatars/jane.jpg",
          },
          replies: [
            {
              id: 4,
              user_id: 4,
              production_id: 2,
              episode_id: null,
              content: "Tôi vẫn không hiết cái totem cuối cùng có ngã không?",
              parent_id: 3,
              likes_count: 25,
              status: "active",
              user: {
                id: 4,
                username: "michael_brown",
                avatar_url: "/avatars/michael.jpg",
              },
            },
          ],
        },
      ],
    },

    {
      id: 3,
      type: "movie",
      title: "Parasite",
      slug: "parasite",
      description: "Phim điện ảnh Hàn Quốc đoạt Oscar",
      poster_url:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRXApPrH2pGi7yXeyu0IxosBOqKa2imJcCO6iauK0kN8PnAx9EY",
      banner_url:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRXApPrH2pGi7yXeyu0IxosBOqKa2imJcCO6iauK0kN8PnAx9EY",
      status: "completed",
      release_year: 2019,
      is_premium: false,
      country: "South Korea",
      rating_avg: 5.0,
      rating_count: 870,
      language: "Korean",

      movie: {
        duration: 7980,
        preview_duration: 300,
      },

      actors: [
        {
          id: 8,
          name: "Johnny Depp",
          slug: "johnny-depp",
          avatar_url: "/actors/johnny-depp.jpg",
          bio: "Thuyền trưởng Jack Sparrow",
          birth_date: "1963-06-09",
          country: "USA",
          gender: "male",
          character_name: "Kim Ki-taek",
          role_type: "cast",
          is_main: true,
          display_order: 1,
        },
        {
          id: 9,
          name: "Emma Watson",
          slug: "emma-watson",
          avatar_url: "/actors/emma-watson.jpg",
          bio: "Hermione trong Harry Potter",
          birth_date: "1990-04-15",
          country: "UK",
          gender: "female",
          character_name: "Park Dong-ik",
          role_type: "cast",
          is_main: true,
          display_order: 2,
        },
      ],

      genres: [
        {
          id: 17,
          name: "Kịch tính",
          slug: "kich-tinh",
        },
        {
          id: 18,
          name: "Bí ẩn",
          slug: "bi-an",
        },
        {
          id: 31,
          name: "Thần thoại",
          slug: "than-thoai",
        },
      ],

      episodes: [
        {
          id: 3,
          episode_number: 1,
          title: "Full Movie",
          duration: 7980,
          thumbnail_url: "/thumbnails/parasite.jpg",
          intro_start: 45,
          intro_end: 105,
          preview_enabled: false,
          views_count: 4001,
        },
      ],
    },

    {
      id: 4,
      type: "movie",
      title: "Spirited Away",
      slug: "spirited-away",
      description: "Phim hoạt hình Nhật Bản của Studio Ghibli",
      poster_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxHMhRJjipKAq43nHmLjdYKO_TIaFbqJouQ-jcUwJfPwZM8p_qoMpufnpzeR9Ht4gOxFCubcpK8mjCm7F1ElLBZN75lu-tvEzx8aSPl5upVQ&s=10",
      banner_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxHMhRJjipKAq43nHmLjdYKO_TIaFbqJouQ-jcUwJfPwZM8p_qoMpufnpzeR9Ht4gOxFCubcpK8mjCm7F1ElLBZN75lu-tvEzx8aSPl5upVQ&s=10",
      status: "completed",
      release_year: 2001,
      is_premium: false,
      country: "Japan",
      rating_avg: 5.0,
      rating_count: 920,
      language: "Japanese",

      movie: {
        duration: 7500,
        preview_duration: 300,
      },

      actors: [
        {
          id: 38,
          name: "Florence Pugh",
          slug: "florence-pugh",
          avatar_url: "/actors/florence-pugh.jpg",
          bio: "Diễn viên trẻ Anh",
          birth_date: "1996-01-03",
          country: "UK",
          gender: "female",
          character_name: "Chihiro Ogino",
          role_type: "cast",
          is_main: true,
          display_order: 1,
        },
      ],

      genres: [
        {
          id: 7,
          name: "Hoạt hình",
          slug: "hoat-hinh",
        },
        {
          id: 16,
          name: "Fantasy",
          slug: "fantasy",
        },
        {
          id: 32,
          name: "Giả tưởng",
          slug: "gia-tuong",
        },
      ],

      episodes: [
        {
          id: 4,
          episode_number: 1,
          title: "Full Movie",
          duration: 7500,
          thumbnail_url: "/thumbnails/spirited-away.jpg",
          intro_start: 30,
          intro_end: 90,
          preview_enabled: false,
          views_count: 3801,
        },
      ],
    },

    {
      id: 6,
      type: "movie",
      title: "Avengers: Endgame",
      slug: "avengers-endgame",
      description: "Phim siêu anh hùng Marvel",
      poster_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHecPjnt9Z7HK4ivC_VwmQoXODHFxyq8SFeq4UUkhKJ8NWWG_nb4bUjzOpzcODi6QqRkt4JYJtTLR2BrIAW7rD9wqq-7_CXOtjQ64b84jd6g&s=10",
      banner_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHecPjnt9Z7HK4ivC_VwmQoXODHFxyq8SFeq4UUkhKJ8NWWG_nb4bUjzOpzcODi6QqRkt4JYJtTLR2BrIAW7rD9wqq-7_CXOtjQ64b84jd6g&s=10",
      status: "completed",
      release_year: 2019,
      is_premium: true,
      country: "USA",
      rating_avg: 4.0,
      rating_count: 2100,
      language: "English",

      movie: {
        duration: 10800,
        preview_duration: 300,
      },

      actors: [
        {
          id: 40,
          name: "Zoe Saldana",
          slug: "zoe-saldana",
          avatar_url: "/actors/zoe-saldana.jpg",
          bio: "Avatar và Guardians",
          birth_date: "1978-06-19",
          country: "USA",
          gender: "female",
          character_name: "Tony Stark / Iron Man",
          role_type: "cast",
          is_main: true,
          display_order: 1,
        },
        {
          id: 41,
          name: "Idris Elba",
          slug: "idris-elba",
          avatar_url: "/actors/idris-elba.jpg",
          bio: "Diễn viên người Anh",
          birth_date: "1972-09-06",
          country: "UK",
          gender: "male",
          character_name: "Steve Rogers / Captain America",
          role_type: "cast",
          is_main: true,
          display_order: 2,
        },
        {
          id: 42,
          name: "Lupita Nyong o",
          slug: "lupita-nyongo",
          avatar_url: "/actors/lupita-nyongo.jpg",
          bio: "Diễn viên đoạt giải Oscar",
          birth_date: "1983-03-01",
          country: "Mexico",
          gender: "female",
          character_name: "Thor",
          role_type: "cast",
          is_main: true,
          display_order: 3,
        },
      ],

      genres: [
        {
          id: 1,
          name: "Hành động",
          slug: "hanh-dong",
        },
        {
          id: 5,
          name: "Viễn tưởng",
          slug: "vien-tuong",
        },
        {
          id: 15,
          name: "Siêu anh hùng",
          slug: "sieu-anh-hung",
        },
      ],

      episodes: [
        {
          id: 6,
          episode_number: 1,
          title: "Full Movie",
          duration: 10800,
          thumbnail_url: "/thumbnails/endgame.jpg",
          intro_start: 60,
          intro_end: 120,
          preview_enabled: true,
          views_count: 6001,
        },
      ],
    },

    {
      id: 21,
      type: "series",
      title: "Stranger Things",
      slug: "stranger-things",
      description:
        "Series khoa học viễn tưởng Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti eius est voluptatum id quo quaerat non. Voluptatibus earum quas, autem cumque perferendis accusamus! Nulla laboriosam eos ipsa facilis fuga consectetur! Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, aperiam. Dicta ut tempore sed minima magni, officiis, aliquam possimus neque libero molestias dolorum placeat similique voluptas, qui officia non quo? Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus, facere officiis facilis, dicta sint illo cumque doloribus dolorum quos voluptates quas, rerum vero corrupti? Voluptatibus numquam quaerat eligendi provident ratione! Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellat sed labore ab quis sapiente, beatae accusantium animi illum modi corporis quod aliquam ea harum, perspiciatis fugit veniam, quo voluptatibus aperiam?Series khoa học viễn tưởng Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti eius est voluptatum id quo quaerat non. Voluptatibus earum quas, autem cumque perferendis accusamus! Nulla laboriosam eos ipsa facilis fuga consectetur! Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, aperiam. Dicta ut tempore sed minima magni, officiis, aliquam possimus neque libero molestias dolorum placeat similique voluptas, qui officia non quo? Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus, facere officiis facilis, dicta sint illo cumque doloribus dolorum quos voluptates quas, rerum vero corrupti? Voluptatibus numquam quaerat eligendi provident ratione! Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellat sed labore ab quis sapiente, beatae accusantium animi illum modi corporis quod aliquam ea harum, perspiciatis fugit veniam, quo voluptatibus aperiam?",
      poster_url:
        "https://upload.wikimedia.org/wikipedia/vi/b/b1/Stranger_Things_season_1.jpg",
      banner_url:
        "https://upload.wikimedia.org/wikipedia/vi/b/b1/Stranger_Things_season_1.jpg",
      status: "ongoing",
      release_year: 2016,
      is_premium: true,
      country: "USA",
      rating_avg: 5.0,
      rating_count: 1250,
      language: "English",

      // Series details (từ bảng series)
      series: {
        total_seasons: 4,
      },

      // Seasons (từ bảng seasons)
      seasons: [
        {
          id: 31,
          season_number: 1,
          total_episodes: 8,
          poster_url: "/posters/st-season1.jpg",

          // Episodes của season này
          episodes: [
            {
              id: 21,
              episode_number: 1,
              title: "Chapter One: The Vanishing of Will Byers",
              duration: 3120,
              thumbnail_url: "/thumbnails/st1e1.jpg",
              intro_start: 60,
              intro_end: 90,
              preview_enabled: true,
              views_count: 2501,
            },
            {
              id: 22,
              episode_number: 2,
              title: "Chapter Two: The Weirdo on Maple Street",
              duration: 3300,
              thumbnail_url: "/thumbnails/st1e2.jpg",
              intro_start: 60,
              intro_end: 90,
              preview_enabled: true,
              views_count: 2301,
            },
            {
              id: 23,
              episode_number: 3,
              title: "Chapter Three: Holly, Jolly",
              duration: 3180,
              thumbnail_url: "/thumbnails/st1e3.jpg",
              intro_start: 60,
              intro_end: 90,
              preview_enabled: true,
              views_count: 2201,
            },
          ],
        },
        {
          id: 32,
          season_number: 2,
          total_episodes: 9,
          poster_url: "/posters/st-season2.jpg",
          episodes: [
            {
              id: 43,
              episode_number: 1,
              title: "Chapter One: MADMAX",
              duration: 3540,
              thumbnail_url: "/thumbnails/st2e1.jpg",
              intro_start: 60,
              intro_end: 90,
              preview_enabled: true,
              views_count: 2101,
            },
          ],
        },
      ],

      actors: [
        {
          id: 10,
          name: "Dwayne Johnson",
          slug: "dwayne-johnson",
          avatar_url: "/actors/dwayne-johnson.jpg",
          bio: "The Rock, diễn viên thể hình",
          birth_date: "1972-05-02",
          country: "USA",
          gender: "male",
          character_name: "Eleven",
          role_type: "cast",
          is_main: true,
          display_order: 1,
        },
        {
          id: 11,
          name: "Chris Hemsworth",
          slug: "chris-hemsworth",
          avatar_url: "/actors/chris-hemsworth.jpg",
          bio: "Thor trong MCU",
          birth_date: "1983-08-11",
          country: "Australia",
          gender: "male",
          character_name: "Mike Wheeler",
          role_type: "cast",
          is_main: true,
          display_order: 2,
        },
        {
          id: 12,
          name: "Angelina Jolie",
          slug: "angelina-jolie",
          avatar_url: "/actors/angelina-jolie.jpg",
          bio: "Diễn viên kiêm đạo diễn",
          birth_date: "1975-06-04",
          country: "USA",
          gender: "female",
          character_name: "Dustin Henderson",
          role_type: "cast",
          is_main: false,
          display_order: 3,
        },
      ],

      genres: [
        {
          id: 5,
          name: "Viễn tưởng",
          slug: "vien-tuong",
        },
        {
          id: 18,
          name: "Bí ẩn",
          slug: "bi-an",
        },
        {
          id: 42,
          name: "Vượt thời gian",
          slug: "vuot-thoi-gian",
        },
      ],

      ratings: [
        {
          user_id: 21,
          rating: 5,
          review_title: "Nostalgia tuyệt vời",
          review_content:
            "Stranger Things mang lại cảm giác hoài niệm thập niên 80. Nhân vật đáng yêu.",
          likes_count: 170,
          is_edited: false,
          user: {
            id: 21,
            username: "amelia_moore",
            avatar_url: "/avatars/amelia.jpg",
          },
        },
      ],

      comments: [
        {
          id: 21,
          user_id: 21,
          production_id: 21,
          episode_id: null,
          content: "Stranger Things mang lại cảm giác hoài niệm thập niên 80!",
          parent_id: null,
          likes_count: 55,
          status: "active",
          user: {
            id: 21,
            username: "amelia_moore",
            avatar_url: "/avatars/amelia.jpg",
          },
          replies: [
            {
              id: 22,
              user_id: 22,
              production_id: 21,
              episode_id: null,
              content: "Eleven là nhân vật nữ mạnh mẽ nhất!",
              parent_id: 21,
              likes_count: 40,
              status: "active",
              user: {
                id: 22,
                username: "matthew_king",
                avatar_url: "/avatars/matthew.jpg",
              },
            },
          ],
        },
      ],
    },

    {
      id: 22,
      type: "series",
      title: "Game of Thrones",
      slug: "game-of-thrones",
      description: "Series fantasy chính kịch",
      poster_url: "/posters/game-of-thrones.jpg",
      banner_url: "/banners/game-of-thrones-banner.jpg",
      status: "completed",
      release_year: 2011,
      is_premium: true,
      country: "USA",
      rating_avg: 4.0,
      rating_count: 1850,
      language: "English",

      series: {
        total_seasons: 8,
      },

      seasons: [
        {
          id: 35,
          season_number: 1,
          total_episodes: 10,
          poster_url: "/posters/got-season1.jpg",
          episodes: [
            {
              id: 26,
              episode_number: 1,
              title: "Winter Is Coming",
              duration: 3720,
              thumbnail_url: "/thumbnails/got1e1.jpg",
              intro_start: 90,
              intro_end: 150,
              preview_enabled: true,
              views_count: 2801,
            },
            {
              id: 27,
              episode_number: 2,
              title: "The Kingsroad",
              duration: 3480,
              thumbnail_url: "/thumbnails/got1e2.jpg",
              intro_start: 90,
              intro_end: 150,
              preview_enabled: true,
              views_count: 2601,
            },
          ],
        },
      ],

      actors: [
        {
          id: 13,
          name: "Will Smith",
          slug: "will-smith",
          avatar_url: "/actors/will-smith.jpg",
          bio: "Diễn viên kiêm rapper",
          birth_date: "1968-09-25",
          country: "USA",
          gender: "male",
          character_name: "Jon Snow",
          role_type: "cast",
          is_main: true,
          display_order: 1,
        },
        {
          id: 14,
          name: "Keanu Reeves",
          slug: "keanu-reeves",
          avatar_url: "/actors/keanu-reeves.jpg",
          bio: "John Wick series",
          birth_date: "1964-09-02",
          country: "Canada",
          gender: "male",
          character_name: "Daenerys Targaryen",
          role_type: "cast",
          is_main: true,
          display_order: 2,
        },
        {
          id: 15,
          name: "Margot Robbie",
          slug: "margot-robbie",
          avatar_url: "/actors/margot-robbie.jpg",
          bio: "Harley Quinn trong DC",
          birth_date: "1990-07-02",
          country: "Australia",
          gender: "female",
          character_name: "Tyrion Lannister",
          role_type: "cast",
          is_main: true,
          display_order: 3,
        },
      ],

      genres: [
        {
          id: 16,
          name: "Fantasy",
          slug: "fantasy",
        },
        {
          id: 17,
          name: "Kịch tính",
          slug: "kich-tinh",
        },
        {
          id: 25,
          name: "Cổ trang",
          slug: "co-trang",
        },
      ],
    },

    {
      id: 23,
      type: "series",
      title: "Breaking Bad",
      slug: "breaking-bad",
      description: "Series tội phạm chính kịch",
      poster_url: "/posters/breaking-bad.jpg",
      banner_url: "/banners/breaking-bad-banner.jpg",
      status: "completed",
      release_year: 2008,
      is_premium: true,
      country: "USA",
      rating_avg: 5.0,
      rating_count: 1320,
      language: "English",

      series: {
        total_seasons: 5,
      },

      seasons: [
        {
          id: 38,
          season_number: 1,
          total_episodes: 7,
          poster_url: "/posters/bb-season1.jpg",
          episodes: [
            {
              id: 29,
              episode_number: 1,
              title: "Pilot",
              duration: 3480,
              thumbnail_url: "/thumbnails/bb1e1.jpg",
              intro_start: 60,
              intro_end: 120,
              preview_enabled: true,
              views_count: 2201,
            },
            {
              id: 30,
              episode_number: 2,
              title: "Cat s in the Bag...",
              duration: 3360,
              thumbnail_url: "/thumbnails/bb1e2.jpg",
              intro_start: 60,
              intro_end: 120,
              preview_enabled: true,
              views_count: 2101,
            },
          ],
        },
      ],

      actors: [
        {
          id: 16,
          name: "Tom Cruise",
          slug: "tom-cruise",
          avatar_url: "/actors/tom-cruise.jpg",
          bio: "Mission Impossible series",
          birth_date: "1962-07-03",
          country: "USA",
          gender: "male",
          character_name: "Walter White",
          role_type: "cast",
          is_main: true,
          display_order: 1,
        },
        {
          id: 17,
          name: "Natalie Portman",
          slug: "natalie-portman",
          avatar_url: "/actors/natalie-portman.jpg",
          bio: "Diễn viên kiêm đạo diễn",
          birth_date: "1981-06-09",
          country: "Israel",
          gender: "female",
          character_name: "Jesse Pinkman",
          role_type: "cast",
          is_main: true,
          display_order: 2,
        },
      ],

      genres: [
        {
          id: 10,
          name: "Hình sự",
          slug: "hinh-su",
        },
        {
          id: 17,
          name: "Kịch tính",
          slug: "kich-tinh",
        },
        {
          id: 38,
          name: "Tội phạm",
          slug: "toi-pham",
        },
      ],
    },

    {
      id: 28,
      type: "series",
      title: "Friends",
      slug: "friends",
      description: "Series hài kịch tình huống",
      poster_url: "/posters/friends.jpg",
      banner_url: "/banners/friends-banner.jpg",
      status: "completed",
      release_year: 1994,
      is_premium: false,
      country: "USA",
      rating_avg: 5.0,
      rating_count: 1950,
      language: "English",

      series: {
        total_seasons: 10,
      },

      seasons: [
        {
          id: 49,
          season_number: 1,
          total_episodes: 24,
          poster_url: "/posters/friends-season1.jpg",
          episodes: [
            {
              id: 40,
              episode_number: 1,
              title: "The One Where Monica Gets a Roommate",
              duration: 1380,
              thumbnail_url: "/thumbnails/friends1e1.jpg",
              intro_start: 30,
              intro_end: 60,
              preview_enabled: false,
              views_count: 3001,
            },
            {
              id: 41,
              episode_number: 2,
              title: "The One with the Sonogram at the End",
              duration: 1320,
              thumbnail_url: "/thumbnails/friends1e2.jpg",
              intro_start: 30,
              intro_end: 60,
              preview_enabled: false,
              views_count: 2901,
            },
          ],
        },
      ],

      actors: [
        {
          id: 27,
          name: "Mark Wahlberg",
          slug: "mark-wahlberg",
          avatar_url: "/actors/mark-wahlberg.jpg",
          bio: "Diễn viên kiêm nhà sản xuất",
          birth_date: "1971-06-05",
          country: "USA",
          gender: "male",
          character_name: "Rachel Green",
          role_type: "cast",
          is_main: true,
          display_order: 1,
        },
        {
          id: 28,
          name: "Sandra Bullock",
          slug: "sandra-bullock",
          avatar_url: "/actors/sandra-bullock.jpg",
          bio: "Nữ diễn viên thành công",
          birth_date: "1964-07-26",
          country: "USA",
          gender: "female",
          character_name: "Monica Geller",
          role_type: "cast",
          is_main: true,
          display_order: 2,
        },
      ],

      genres: [
        {
          id: 3,
          name: "Hài hước",
          slug: "hai-huoc",
        },
        {
          id: 20,
          name: "Hài kịch",
          slug: "hai-kich",
        },
        {
          id: 26,
          name: "Hiện đại",
          slug: "hien-dai",
        },
      ],
    },

    {
      id: 30,
      type: "series",
      title: "Black Mirror",
      slug: "black-mirror",
      description: "Series khoa học viễn tưởng",
      poster_url: "/posters/black-mirror.jpg",
      banner_url: "/banners/black-mirror-banner.jpg",
      status: "ongoing",
      release_year: 2011,
      is_premium: true,
      country: "UK",
      rating_avg: 4.0,
      rating_count: 890,
      language: "English",

      series: {
        total_seasons: 6,
      },

      seasons: [
        {
          id: 50,
          season_number: 1,
          total_episodes: 3,
          poster_url: "/posters/black-mirror-season1.jpg",
          episodes: [
            {
              id: 55,
              episode_number: 1,
              title: "The National Anthem",
              duration: 2640,
              thumbnail_url: "/thumbnails/bm1e1.jpg",
              intro_start: 45,
              intro_end: 90,
              preview_enabled: true,
              views_count: 1800,
            },
          ],
        },
      ],

      actors: [
        {
          id: 36,
          name: "Zendaya",
          slug: "zendaya",
          avatar_url: "/actors/zendaya.jpg",
          bio: "Diễn viên trẻ tài năng",
          birth_date: "1996-09-01",
          country: "USA",
          gender: "female",
          character_name: "Various Characters",
          role_type: "cast",
          is_main: true,
          display_order: 1,
        },
        {
          id: 37,
          name: "Timothée Chalamet",
          slug: "timothee-chalamet",
          avatar_url: "/actors/timothee-chalamet.jpg",
          bio: "Diễn viên trẻ triển vọng",
          birth_date: "1995-12-27",
          country: "USA",
          gender: "male",
          character_name: "Various Characters",
          role_type: "cast",
          is_main: true,
          display_order: 2,
        },
      ],

      genres: [
        {
          id: 5,
          name: "Viễn tưởng",
          slug: "vien-tuong",
        },
        {
          id: 18,
          name: "Bí ẩn",
          slug: "bi-an",
        },
        {
          id: 42,
          name: "Vượt thời gian",
          slug: "vuot-thoi-gian",
        },
      ],
    },
  ],

  // ==================== USERS ====================
  users: [
    {
      id: 1,
      username: "admin",
      email: "admin@moviehub.com",
      avatar_url: "/avatars/admin.jpg",
      role: "admin",
      vip_expires_at: "2025-12-31T23:59:59.000Z",
      auto_renew: true,
      provider: "local",
      total_watch_time: 86400,
      last_login: "2026-01-22T07:36:26.000Z",

      // Watch history của user
      watch_history: [
        {
          episode_id: 1,
          last_position: 9120,
          watched_percent: 100.0,
          watched_duration: 9120,
          is_completed: true,
          first_watched_at: "2024-01-15T13:30:00.000Z",
          last_watched_at: "2024-01-15T15:30:00.000Z",
          episode: {
            id: 1,
            title: "Full Movie",
            duration: 9120,
            thumbnail_url: "/thumbnails/dark-knight.jpg",
            production: {
              id: 1,
              title: "The Dark Knight",
              poster_url: "/posters/dark-knight.jpg",
            },
          },
        },
      ],

      // Bookmarks của user
      bookmarks: [
        {
          production_id: 1,
          note: "Phim hay nhất về Batman",
          notify_new_episode: true,
          production: {
            id: 1,
            title: "The Dark Knight",
            poster_url: "/posters/dark-knight.jpg",
            type: "movie",
          },
        },
      ],

      // Subscriptions của user
      subscriptions: [
        {
          id: 50,
          plan_id: 3,
          transaction_id: 50,
          start_date: "2024-02-19T00:00:00.000Z",
          end_date: "2025-02-18T23:59:59.000Z",
          status: "active",
          auto_renew: true,
          plan: {
            id: 3,
            name: "VIP Premium 1 Năm",
            code: "vip_1_year",
            price: 990000.0,
            discount_price: 699000.0,
            duration_days: 365,
          },
        },
      ],
    },
    {
      id: 2,
      username: "john_doe",
      email: "john.doe@email.com",
      avatar_url: "/avatars/john.jpg",
      role: "user",
      vip_expires_at: "2024-12-31T23:59:59.000Z",
      auto_renew: true,
      provider: "local",
      total_watch_time: 43200,

      watch_history: [
        {
          episode_id: 2,
          last_position: 4440,
          watched_percent: 50.0,
          watched_duration: 4440,
          is_completed: false,
          episode: {
            id: 2,
            title: "Full Movie",
            duration: 8880,
            thumbnail_url: "/thumbnails/inception.jpg",
            production: {
              id: 2,
              title: "Inception",
              poster_url: "/posters/inception.jpg",
            },
          },
        },
      ],

      bookmarks: [
        {
          production_id: 2,
          note: "Cần xem lại để hiểu plot",
          notify_new_episode: true,
          production: {
            id: 2,
            title: "Inception",
            poster_url: "/posters/inception.jpg",
          },
        },
      ],

      subscriptions: [
        {
          id: 1,
          plan_id: 1,
          transaction_id: 1,
          start_date: "2024-01-01T00:00:00.000Z",
          end_date: "2024-01-31T23:59:59.000Z",
          status: "expired",
          auto_renew: true,
          plan: {
            id: 1,
            name: "VIP Basic 1 Tháng",
            code: "vip_1_month",
            price: 99000.0,
            discount_price: 69000.0,
            duration_days: 30,
          },
        },
      ],
    },
    {
      id: 3,
      username: "jane_smith",
      email: "jane.smith@email.com",
      avatar_url: "/avatars/jane.jpg",
      role: "user",
      vip_expires_at: "2024-11-30T23:59:59.000Z",
      auto_renew: false,
      provider: "local",
      total_watch_time: 64800,

      watch_history: [
        {
          episode_id: 3,
          last_position: 7980,
          watched_percent: 100.0,
          watched_duration: 7980,
          is_completed: true,
          episode: {
            id: 3,
            title: "Full Movie",
            duration: 7980,
            thumbnail_url: "/thumbnails/parasite.jpg",
            production: {
              id: 3,
              title: "Parasite",
              poster_url: "/posters/parasite.jpg",
            },
          },
        },
      ],
    },
    {
      id: 21,
      username: "amelia_moore",
      email: "amelia.m@email.com",
      avatar_url: "/avatars/amelia.jpg",
      role: "user",
      vip_expires_at: null,
      auto_renew: false,
      provider: "local",
      total_watch_time: 12600,

      watch_history: [
        {
          episode_id: 21,
          last_position: 3120,
          watched_percent: 100.0,
          watched_duration: 3120,
          is_completed: true,
          episode: {
            id: 21,
            title: "Chapter One: The Vanishing of Will Byers",
            duration: 3120,
            thumbnail_url: "/thumbnails/st1e1.jpg",
            production: {
              id: 31,
              title: "Stranger Things - Season 1",
              poster_url: "/posters/st-season1.jpg",
            },
          },
        },
      ],

      bookmarks: [
        {
          production_id: 21,
          note: "Series hay nhất Netflix",
          notify_new_episode: true,
          production: {
            id: 21,
            title: "Stranger Things",
            poster_url: "/posters/stranger-things.jpg",
          },
        },
      ],
    },
  ],

  // ==================== GENRES ====================
  genres: [
    {
      id: 1,
      name: "Hành động",
      slug: "hanh-dong",
      description: "Phim hành động kịch tính",
      productions: [
        {
          id: 1,
          title: "The Dark Knight",
          poster_url: "/posters/dark-knight.jpg",
          rating_avg: 5.0,
          is_premium: true,
        },
        {
          id: 2,
          title: "Inception",
          poster_url: "/posters/inception.jpg",
          rating_avg: 5.0,
          is_premium: true,
        },
        {
          id: 6,
          title: "Avengers: Endgame",
          poster_url: "/posters/endgame.jpg",
          rating_avg: 4.0,
          is_premium: true,
        },
      ],
    },
    {
      id: 5,
      name: "Viễn tưởng",
      slug: "vien-tuong",
      description: "Phim viễn tưởng khoa học",
      productions: [
        {
          id: 2,
          title: "Inception",
          poster_url: "/posters/inception.jpg",
        },
        {
          id: 6,
          title: "Avengers: Endgame",
          poster_url: "/posters/endgame.jpg",
        },
        {
          id: 21,
          title: "Stranger Things",
          poster_url: "/posters/stranger-things.jpg",
        },
      ],
    },
    {
      id: 7,
      name: "Hoạt hình",
      slug: "hoat-hinh",
      description: "Phim hoạt hình cho mọi lứa tuổi",
      productions: [
        {
          id: 4,
          title: "Spirited Away",
          poster_url: "/posters/spirited-away.jpg",
          rating_avg: 5.0,
          is_premium: false,
        },
      ],
    },
    {
      id: 15,
      name: "Siêu anh hùng",
      slug: "sieu-anh-hung",
      description: "Phim về siêu anh hùng",
      productions: [
        {
          id: 1,
          title: "The Dark Knight",
          poster_url: "/posters/dark-knight.jpg",
        },
        {
          id: 6,
          title: "Avengers: Endgame",
          poster_url: "/posters/endgame.jpg",
        },
      ],
    },
    {
      id: 16,
      name: "Fantasy",
      slug: "fantasy",
      description: "Phim fantasy kỳ ảo",
      productions: [
        {
          id: 4,
          title: "Spirited Away",
          poster_url: "/posters/spirited-away.jpg",
        },
        {
          id: 22,
          title: "Game of Thrones",
          poster_url: "/posters/game-of-thrones.jpg",
        },
      ],
    },
  ],

  // ==================== ACTORS ====================
  actors: [
    {
      id: 1,
      name: "Tom Hanks",
      slug: "tom-hanks",
      avatar_url: "/actors/tom-hanks.jpg",
      bio: "Diễn viên Mỹ nổi tiếng",
      birth_date: "1956-07-09",
      country: "USA",
      gender: "male",

      // Productions mà diễn viên này tham gia
      productions: [
        {
          production_id: 1,
          character_name: "Bruce Wayne / Batman",
          role_type: "cast",
          is_main: true,
          display_order: 1,
          production: {
            id: 1,
            title: "The Dark Knight",
            poster_url: "/posters/dark-knight.jpg",
            type: "movie",
            rating_avg: 5.0,
          },
        },
      ],
    },
    {
      id: 2,
      name: "Leonardo DiCaprio",
      slug: "leonardo-dicaprio",
      avatar_url: "/actors/leonardo-dicaprio.jpg",
      bio: "Diễn viên Hollywood",
      birth_date: "1974-11-11",
      country: "USA",
      gender: "male",

      productions: [
        {
          production_id: 1,
          character_name: "Harvey Dent / Two-Face",
          role_type: "cast",
          is_main: true,
          display_order: 2,
          production: {
            id: 1,
            title: "The Dark Knight",
            poster_url: "/posters/dark-knight.jpg",
          },
        },
        {
          production_id: 2,
          character_name: "Dom Cobb",
          role_type: "cast",
          is_main: true,
          display_order: 1,
          production: {
            id: 2,
            title: "Inception",
            poster_url: "/posters/inception.jpg",
          },
        },
      ],
    },
  ],

  // ==================== SUBSCRIPTION PLANS ====================
  subscriptionPlans: [
    {
      id: 1,
      name: "VIP Basic 1 Tháng",
      code: "vip_1_month",
      description: "Gói VIP cơ bản 1 tháng",
      duration_days: 30,
      price: 99000.0,
      discount_price: 69000.0,
      currency: "VND",
      features: {
        "4k": false,
        ad_free: true,
        devices: 1,
        download: 10,
      },
      is_active: true,
      display_order: 1,
    },
    {
      id: 2,
      name: "VIP Pro 6 Tháng",
      code: "vip_6_month",
      description: "Gói VIP chuyên nghiệp 6 tháng",
      duration_days: 180,
      price: 540000.0,
      discount_price: 399000.0,
      currency: "VND",
      features: {
        "4k": true,
        ad_free: true,
        devices: 3,
        download: 50,
        early_access: true,
      },
      is_active: true,
      display_order: 2,
    },
    {
      id: 3,
      name: "VIP Premium 1 Năm",
      code: "vip_1_year",
      description: "Gói VIP cao cấp 1 năm",
      duration_days: 365,
      price: 990000.0,
      discount_price: 699000.0,
      currency: "VND",
      features: {
        "4k": true,
        ad_free: true,
        devices: 5,
        download: 100,
        early_access: true,
        offline_view: true,
      },
      is_active: true,
      display_order: 3,
    },
  ],

  // ==================== HELPER FUNCTIONS ====================

  // Lấy tất cả productions
  getAllProductions: function () {
    return this.productions;
  },

  // Lấy production theo ID
  getProductionById: function (id) {
    return this.productions.find((p) => p.id === id);
  },

  // Lấy tất cả movies
  getAllMovies: function () {
    return this.productions.filter((p) => p.type === "movie");
  },

  // Lấy tất cả series
  getAllSeries: function () {
    return this.productions.filter((p) => p.type === "series");
  },

  // Lấy productions nổi bật
  getFeaturedProductions: function () {
    return this.productions.filter((p) => [1, 2, 21, 6, 28].includes(p.id));
  },

  // Lấy productions premium
  getPremiumProductions: function () {
    return this.productions.filter((p) => p.is_premium);
  },

  // Lấy productions free
  getFreeProductions: function () {
    return this.productions.filter((p) => !p.is_premium);
  },

  // Tìm kiếm productions
  searchProductions: function (query) {
    const lowerQuery = query.toLowerCase();
    return this.productions.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.actors.some((actor) => actor.name.toLowerCase().includes(lowerQuery)),
    );
  },

  // Lấy productions theo genre
  getProductionsByGenre: function (genreId) {
    return this.productions.filter((p) =>
      p.genres.some((g) => g.id === genreId),
    );
  },

  // Lấy user theo ID
  getUserById: function (id) {
    return this.users.find((u) => u.id === id);
  },

  // Lấy user theo username
  getUserByUsername: function (username) {
    return this.users.find((u) => u.username === username);
  },

  // Lấy genre theo slug
  getGenreBySlug: function (slug) {
    return this.genres.find((g) => g.slug === slug);
  },

  // Lấy actor theo slug
  getActorBySlug: function (slug) {
    return this.actors.find((a) => a.slug === slug);
  },

  // Lấy episode theo ID
  getEpisodeById: function (id) {
    for (const production of this.productions) {
      if (production.type === "movie") {
        if (
          production.episodes &&
          production.episodes[0] &&
          production.episodes[0].id === id
        ) {
          return {
            ...production.episodes[0],
            production: {
              id: production.id,
              title: production.title,
              type: production.type,
              poster_url: production.poster_url,
            },
          };
        }
      } else if (production.type === "series") {
        for (const season of production.seasons) {
          const episode = season.episodes.find((e) => e.id === id);
          if (episode) {
            return {
              ...episode,
              production: {
                id: production.id,
                title: production.title,
                type: production.type,
                poster_url: production.poster_url,
              },
              season: {
                id: season.id,
                season_number: season.season_number,
              },
            };
          }
        }
      }
    }
    return null;
  },

  // Lấy productions đang hot (nhiều views)
  getTrendingProductions: function () {
    return [...this.productions]
      .sort((a, b) => {
        const aViews =
          a.episodes?.reduce((sum, ep) => sum + (ep.views_count || 0), 0) || 0;
        const bViews =
          b.episodes?.reduce((sum, ep) => sum + (ep.views_count || 0), 0) || 0;
        return bViews - aViews;
      })
      .slice(0, 5);
  },

  // Lấy productions mới nhất
  getNewestProductions: function () {
    return [...this.productions]
      .sort((a, b) => new Date(b.release_year) - new Date(a.release_year))
      .slice(0, 5);
  },

  // Lấy productions rating cao nhất
  getTopRatedProductions: function () {
    return [...this.productions]
      .filter((p) => p.rating_count > 0)
      .sort((a, b) => b.rating_avg - a.rating_avg)
      .slice(0, 5);
  },
};

export default mockDB;
