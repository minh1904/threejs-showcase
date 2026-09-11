import type { LessonContent } from '../types';

export const LESSON_1_7: LessonContent = {
  id: '1-7',

  goal: 'Có một URL công khai chạy được trên điện thoại thật, và đi trọn một vòng quy trình `branch → PR → preview → merge`.',

  lecture: [
    'Bài này không có code mới, và đó là chủ ý. Three.js Journey đặt bài "Go live" ở vị trí thứ 13 — ngay trong chương cơ bản, trước cả bài về ánh sáng. Lý do rất thực tế: khi đã có một đường link chạy thật, mỗi bài học sau đó đều cộng dồn vào một thứ hữu hình. Còn nếu để tới cuối lộ trình mới deploy, bạn sẽ có năm tuần code nằm im trên máy và một buổi tối vật lộn với đủ thứ lỗi build cùng lúc.',

    'Có một lý do thứ hai quan trọng hơn với riêng đồ hoạ 3D: **điện thoại là một thế giới khác**. GPU di động yếu hơn nhiều lần, bộ nhớ ít hơn, và một số tính năng WebGL đơn giản là không có. Một scene chạy 120fps trên laptop của bạn hoàn toàn có thể tụt xuống 20fps trên máy tầm trung. Chế độ giả lập điện thoại của DevTools **không** mô phỏng được điều này — nó chỉ đổi kích thước khung nhìn, còn vẫn chạy trên GPU máy tính của bạn.',

    'Phần thứ ba là quy trình Git. Mô tả công việc cho vị trí Front-End thường yêu cầu rõ "Git: branching, merge, pull request". Đây là dịp để bạn đi trọn vòng đó một cách tự nhiên thay vì học lý thuyết: tạo nhánh, sửa một thứ nhỏ, mở PR, xem Vercel tự dựng bản preview riêng cho nhánh đó, rồi merge. Preview deployment theo từng PR cũng chính là cách các đội thật review giao diện trước khi lên production.',
  ],

  concepts: [
    {
      term: 'Vercel + GitHub',
      explain:
        'Nối repo một lần, sau đó mỗi lần push lên nhánh chính là một lần deploy production tự động. Next.js là sản phẩm của chính Vercel nên gần như không cần cấu hình gì.',
    },
    {
      term: 'Preview deployment',
      explain:
        'Mỗi pull request được cấp một URL riêng chạy đúng code của nhánh đó. Đây là cách đội ngũ thật review giao diện — quan trọng gấp bội với đồ hoạ 3D, vì ảnh chụp màn hình không nói lên được gì về hiệu năng.',
    },
    {
      term: 'Kiểm thử trên thiết bị thật',
      explain:
        'Chế độ responsive của DevTools chỉ đổi kích thước khung nhìn, vẫn dùng GPU máy tính. Muốn biết scene chạy thế nào trên điện thoại thì phải mở trên điện thoại.',
    },
    {
      term: 'remote debugging',
      explain:
        'Cắm Android vào máy rồi mở `chrome://inspect` để xem Console và Performance của tab trên điện thoại. Với iPhone thì dùng Safari trên macOS qua menu Develop.',
    },
  ],

  walkthrough: [
    {
      action: 'Push code lên GitHub nếu chưa có repo.',
      why: 'Vercel deploy từ repo chứ không upload thủ công. Đây cũng là cách bạn có lịch sử thay đổi để dẫn chứng khi phỏng vấn.',
    },
    {
      action: 'Vào vercel.com, chọn Import Project, trỏ vào repo. Không cần đổi cấu hình nào.',
      why: 'Vercel tự nhận diện Next.js. Nếu build lỗi ở đây thì gần như luôn là do lỗi TypeScript hoặc ESLint bị bỏ qua ở máy local — hãy chạy `bun run build` trước khi push.',
    },
    {
      action: 'Mở URL vừa được cấp trên **điện thoại thật**, không dùng chế độ giả lập.',
      why: 'Đây là bước không thể thay thế. Bạn cần biết scene của mình thực sự chạy ra sao trên phần cứng di động.',
    },
    {
      action: 'Ghi lại FPS trên desktop và trên điện thoại của bạn vào ghi chú.',
      why: 'Con số này là mốc so sánh cho toàn bộ Module 5 về hiệu năng. Không có mốc thì không đo được cải thiện.',
    },
    {
      action: 'Tạo nhánh mới, sửa một thứ nhỏ, push rồi mở Pull Request.',
      why: 'Vercel sẽ tự bình luận vào PR kèm link preview. Hãy mở link đó và xác nhận nó khác với bản production.',
    },
    {
      action: 'Merge PR và xem bản production tự cập nhật.',
      why: 'Trọn vẹn một vòng. Đây chính xác là quy trình được nêu trong phần yêu cầu Git của mô tả công việc.',
    },
  ],

  observations: [
    {
      change: 'So sánh FPS giữa desktop và điện thoại trên cùng một scene.',
      observe: 'Điện thoại thường thấp hơn đáng kể, đôi khi chỉ bằng một phần ba.',
      why: 'GPU di động bị giới hạn công suất và tản nhiệt, đồng thời màn hình lại có DPR cao — nghĩa là phải tô nhiều pixel hơn bằng phần cứng yếu hơn. Đây chính là lý do bài 1.1 nhấn mạnh việc chặn `setPixelRatio` ở 2.',
    },
    {
      change: 'Để scene chạy liên tục trên điện thoại khoảng năm phút.',
      observe: 'FPS tụt dần dù không có gì thay đổi trong cảnh.',
      why: 'Hiện tượng **thermal throttling**: máy nóng lên và hệ điều hành chủ động giảm xung GPU để hạ nhiệt. Đây là lý do đo hiệu năng trên di động phải đo sau vài phút chạy, chứ không phải ở giây đầu tiên.',
    },
    {
      change: 'Mở bản preview của PR và bản production cạnh nhau.',
      observe: 'Hai URL khác nhau, nội dung khác nhau, cùng tồn tại song song.',
      why: 'Mỗi nhánh có bản dựng riêng biệt. Điều này cho phép review thay đổi mà không đụng tới bản người dùng đang xem — và với đồ hoạ 3D, nó cho phép người review tự cảm nhận hiệu năng thay vì đoán qua ảnh chụp.',
    },
  ],

  interview: [
    {
      q: 'Bạn kiểm thử ứng dụng WebGL trên di động như thế nào?',
      a: 'Luôn trên thiết bị thật, vì chế độ giả lập của DevTools chỉ đổi kích thước khung nhìn mà vẫn chạy trên GPU máy tính. Tôi dùng remote debugging — `chrome://inspect` với Android, Safari Develop với iOS — để xem Console và đo hiệu năng ngay trên máy đó. Và tôi đo sau vài phút chạy liên tục, không phải ở giây đầu, để tính cả yếu tố thermal throttling.',
    },
    {
      q: 'Vì sao nên deploy sớm thay vì để tới cuối dự án?',
      a: 'Vì lỗi phát hiện sớm thì rẻ. Sự chênh lệch giữa môi trường local và production — biến môi trường, đường dẫn asset, khác biệt khi build — nếu dồn lại tới cuối sẽ nổ ra cùng lúc. Riêng với 3D còn một lý do nữa: chỉ khi chạy trên thiết bị thật bạn mới biết ngân sách hiệu năng thực sự của mình là bao nhiêu, và con số đó nên định hình mọi quyết định kỹ thuật phía sau.',
    },
    {
      q: 'Preview deployment giải quyết vấn đề gì?',
      a: 'Nó cho phép review một thay đổi trên bản chạy thật trước khi merge, thay vì tin vào ảnh chụp màn hình hay mô tả bằng lời. Với giao diện 3D thì càng cần, vì ảnh tĩnh không thể hiện được độ mượt, độ trễ tương tác hay hành vi khi resize. Nó cũng cô lập rủi ro: nhánh hỏng không ảnh hưởng URL production.',
    },
  ],

  checkpoints: [
    'Có URL công khai mở được trên điện thoại.',
    'Đã ghi lại FPS trên desktop và trên di động làm mốc cho Module 5.',
    'Đã đi trọn vòng `branch → PR → preview → merge`.',
    'Giải thích được vì sao không thể thay thiết bị thật bằng chế độ giả lập của DevTools.',
  ],
};
