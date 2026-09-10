import type { LessonContent } from '../types';

export const LESSON_6_6: LessonContent = {
  id: '6-6',

  goal: 'Có một URL đưa vào CV được, và kể được câu chuyện kỹ thuật đằng sau nó mà không cần nhìn màn hình.',

  lecture: [
    'Bài cuối không thêm kỹ thuật mới. Nó biến ba mươi bảy bài trước thành một thứ dùng được khi đi xin việc. Đây là phần nhiều người bỏ qua, và cũng là phần tạo khác biệt lớn nhất — vì kỹ năng không ai nhìn thấy thì không tính.',

    'Trước hết là **hoàn thiện kỹ thuật**. Kiểm tra mọi bài trên điện thoại thật, không phải chế độ giả lập, và sửa những chỗ vỡ. Chạy Lighthouse để xem kích thước gói và thời gian tải. Tách code bằng `next/dynamic` với `ssr: false` cho các scene nặng — không có lý do gì bắt người xem trang chủ tải toàn bộ mã của ba mươi tám cảnh 3D. Và rà lại rò rỉ bộ nhớ theo đúng cách bài 5.5.',

    'Thứ hai, và đây là phần đáng giá nhất: **README cho từng bài, đúng ba dòng**. Bài toán là gì. Quyết định kỹ thuật đáng chú ý. Và **số liệu hiệu năng** — lấy từ những bảng bạn đã đo suốt Module 5. Ba dòng đó biến một demo thành một hồ sơ kỹ thuật. Người đọc CV không có thời gian đọc code của bạn, nhưng họ đọc được ba dòng.',

    'Thứ ba là **chuẩn bị kể chuyện**. Chọn ba bài bạn tự tin nhất và luyện kể mỗi bài trong hai phút theo đúng cấu trúc: bài toán, cách làm, vướng ở đâu, số liệu ra sao. Phần "vướng ở đâu" quan trọng hơn người ta tưởng — nó cho thấy bạn đã thật sự làm chứ không chép. Và hãy sẵn sàng mở code trực tiếp nếu được hỏi.',

    'Một lời khuyên cuối về cách trình bày. Đừng nói "em làm được bloom". Hãy nói "bloom lấy mất mười tám khung hình mỗi giây trên iPhone 12 nên em chỉ bật ở desktop và dùng PerformanceMonitor để tự tắt khi FPS tụt". Câu thứ hai cho thấy bạn hiểu đánh đổi, biết đo đạc, và nghĩ tới người dùng thật. Đó là khác biệt giữa người biết dùng thư viện và người làm được sản phẩm.',
  ],

  concepts: [
    {
      term: 'next/dynamic với ssr: false',
      explain:
        'Tách mã của scene 3D ra khỏi gói ban đầu và bỏ qua render phía máy chủ — cần thiết vì WebGL không tồn tại trên máy chủ.',
    },
    {
      term: 'Lighthouse',
      explain:
        'Đo kích thước gói, thời gian tải, và các chỉ số trải nghiệm. Với trang 3D, hãy chú ý riêng thời gian tới lúc tương tác được chứ không chỉ điểm tổng.',
    },
    {
      term: 'README ba dòng',
      explain:
        'Bài toán / quyết định kỹ thuật / số liệu hiệu năng. Định dạng ngắn nhất mà vẫn chứng minh được năng lực.',
    },
    {
      term: 'Cấu trúc kể hai phút',
      explain:
        'Bài toán → cách làm → vướng ở đâu → số liệu. Phần "vướng ở đâu" là phần cho thấy bạn đã thật sự làm.',
    },
    {
      term: 'Phương án dự phòng',
      explain:
        'Kiểm tra WebGL khả dụng không, và hiện nội dung thay thế nếu không. Trang phải dùng được ngay cả khi 3D không chạy.',
    },
  ],

  walkthrough: [
    {
      action: 'Deploy bản cuối lên Vercel.',
      why: 'Chạy `bun run build` ở máy trước để không phát hiện lỗi kiểu dữ liệu ngay trên môi trường triển khai.',
    },
    {
      action: 'Mở **mọi** bài trên điện thoại thật và ghi lại chỗ nào vỡ.',
      why: 'Sẽ có chỗ vỡ. Bố cục, hiệu năng, vùng chạm quá nhỏ — đều là những thứ chỉ lộ trên thiết bị thật.',
    },
    {
      action: 'Chạy Lighthouse và xem kích thước gói cùng thời gian tải.',
      why: 'Với trang 3D, con số đáng quan tâm nhất là thời gian tới lúc tương tác được, không phải điểm tổng.',
    },
    {
      action: 'Tách mã bằng `next/dynamic` với `ssr: false` cho các scene nặng.',
      why: 'Người xem trang chủ không nên phải tải mã của ba mươi tám cảnh 3D.',
    },
    {
      action: 'Rà lại rò rỉ bộ nhớ trên từng bài theo cách bài 5.5.',
      why: 'Người xem sẽ chuyển qua lại nhiều bài. Rò rỉ tích luỹ sẽ khiến tab treo — đúng lúc bạn không muốn nhất.',
    },
    {
      action: 'Viết README ba dòng cho mỗi bài: bài toán, quyết định kỹ thuật, số liệu.',
      why: 'Lấy số liệu từ các bảng đã đo ở Module 5. Nếu bảng nào còn trống, quay lại đo.',
    },
    {
      action: 'Quay một video ba mươi giây lướt qua toàn bộ showcase.',
      why: 'Gắn vào CV và tin nhắn ứng tuyển. Nhiều người sẽ xem video mà không bao giờ mở link.',
    },
    {
      action: 'Chọn ba bài tự tin nhất, luyện kể mỗi bài trong hai phút.',
      why: 'Luyện thành tiếng, đừng chỉ nghĩ trong đầu. Nói ra mới lộ chỗ mình chưa thật sự hiểu.',
    },
  ],

  observations: [
    {
      change: 'Chạy Lighthouse trước và sau khi tách mã bằng `next/dynamic`.',
      observe: 'Kích thước gói ban đầu giảm rõ rệt và thời gian tương tác được cải thiện.',
      why: 'Mặc định, mọi thứ được import tĩnh đều nằm trong gói ban đầu, kể cả mã của những cảnh người dùng chưa mở. Với ba mươi tám cảnh cộng Three.js cộng drei, con số đó rất lớn. Tách theo route hoặc theo component khiến mỗi cảnh chỉ tải khi thực sự được xem.',
    },
    {
      change: 'Mở showcase trên một điện thoại tầm trung đời cũ.',
      observe: 'Một số bài chạy tốt, một số tụt xuống dưới mức dùng được.',
      why: 'Đây là dữ liệu quý nhất bạn có được từ toàn bộ lộ trình. Nó cho biết ngân sách hiệu năng thật của bạn, và ngân sách đó nên định hình mọi quyết định kỹ thuật về sau. Nó cũng cho bạn câu chuyện cụ thể để kể — bài nào bạn đã phải cắt gì để nó chạy được.',
    },
    {
      change: 'Chuyển qua lại giữa mười bài liên tiếp và theo dõi bộ nhớ trong DevTools.',
      observe: 'Nếu có bài rò rỉ, đồ thị bộ nhớ đi lên theo bậc và không trả về.',
      why: 'Đây chính xác là điều người xem sẽ làm — lướt nhanh qua nhiều bài. Rò rỉ ở một bài duy nhất cũng đủ khiến tab chậm dần rồi treo sau vài phút. Và nó sẽ xảy ra đúng lúc người phỏng vấn đang xem.',
    },
    {
      change: 'Thử kể một bài trong hai phút, bấm giờ, nói thành tiếng.',
      observe: 'Lần đầu gần như chắc chắn quá giờ hoặc bỏ sót phần số liệu.',
      why: 'Kể chuyện kỹ thuật là kỹ năng riêng, không tự có từ việc biết làm. Hai phút rất ngắn, nên bạn buộc phải chọn điều gì quan trọng nhất. Việc luyện cũng lộ ra những chỗ bạn tưởng mình hiểu nhưng chưa diễn đạt được — đó là phản hồi có giá trị nhất.',
    },
  ],

  interview: [
    {
      q: 'Kể về một dự án 3D bạn đã làm.',
      a: 'Nên dùng cấu trúc bốn phần trong hai phút. Bài toán: dựng showcase học Three.js gồm ba mươi tám bài tương tác. Cách làm: vanilla Three.js cho ba module đầu để nắm bản chất, rồi chuyển sang R3F, với dữ liệu bài học tách khỏi component scene nên thêm bài mới chỉ cần một file. Vướng ở đâu: hiệu năng trên di động, nhiều bài tụt dưới ba mươi khung hình. Số liệu: chặn pixel ratio ở 2 và thay bóng thật bằng contact shadows đưa được từ mười tám lên bốn mươi hai khung hình trên máy thử. Phần số liệu là phần quyết định.',
    },
    {
      q: 'Bạn tối ưu kích thước gói cho ứng dụng 3D thế nào?',
      a: 'Tách mã theo cảnh bằng `next/dynamic` với `ssr: false`, vì WebGL không tồn tại phía máy chủ và không cảnh nào cần nằm trong gói ban đầu. Import Three.js theo tên cụ thể thay vì cả không gian tên để tree-shaking hoạt động. Tải động các bộ giải mã Draco và KTX2, chỉ khi gặp file cần chúng. Và tài nguyên thì tải theo nhu cầu kèm preload có chọn lọc cho nội dung người dùng sắp xem.',
    },
    {
      q: 'Bạn kiểm thử ứng dụng 3D trước khi phát hành thế nào?',
      a: 'Trên thiết bị thật, tối thiểu một máy Android tầm trung và một iPhone, vì chế độ giả lập không mô phỏng được GPU. Kiểm tra rò rỉ bộ nhớ bằng cách chuyển qua lại nhiều cảnh và theo dõi `renderer.info.memory` cùng đồ thị heap. Đo Lighthouse cho kích thước gói và thời gian tương tác được. Và luôn có phương án dự phòng khi WebGL không khả dụng — trang phải còn dùng được chứ không trắng xoá.',
    },
    {
      q: 'Điều gì bạn học được rõ nhất qua dự án này?',
      a: 'Rằng gần như mọi quyết định trong đồ hoạ thời gian thực là một đánh đổi, và không có đánh đổi nào đúng cho mọi trường hợp — chỉ có đánh đổi đúng cho ngân sách hiệu năng cụ thể của bạn. Điều đó buộc phải đo trước khi quyết. Bài học thứ hai là học vanilla trước R3F đã trả giá xứng đáng: khi có sự cố, tôi gỡ được vì biết bên dưới đang gọi API nào, thay vì chỉ biết component nào không hoạt động.',
    },
  ],

  checkpoints: [
    'Có URL công khai chạy được trên điện thoại, đưa vào CV được.',
    'Mỗi bài có README ba dòng kèm số liệu hiệu năng thật.',
    'Đã kiểm tra không bài nào rò rỉ bộ nhớ.',
    'Kể được ba bài trong hai phút mỗi bài, không cần nhìn màn hình.',
  ],
};
