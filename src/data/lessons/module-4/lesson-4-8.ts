import type { LessonContent } from '../types';

export const LESSON_4_8: LessonContent = {
  id: '4-8',

  goal: 'Tổ chức code sao cho thêm bài học thứ 20 không khó hơn thêm bài thứ 2 — đo bằng số file phải sửa khi thêm một bài mới.',

  lecture: [
    'Đây là bài không-phải-dự-án dài nhất trong khoá Three.js Journey: 3 giờ 20 phút. Lý do là kiến trúc không phải chuyện thẩm mỹ mà là chuyện tốc độ. Một dự án tổ chức kém khiến mỗi tính năng mới đắt hơn tính năng trước, cho tới lúc bạn không muốn động vào nó nữa.',

    'Tới đây bạn đã có khoảng hai mươi bài học nằm rải rác. Bài này không thêm tính năng nào — nó dọn dẹp. Và có một phép thử rất cụ thể để biết bạn làm đúng hay chưa, tôi sẽ nói ở cuối.',

    'Nguyên tắc đầu tiên là **tách ba tầng**. Dữ liệu bài học (tiêu đề, mô tả, nội dung) tách khỏi component 3D của scene, và cả hai tách khỏi component giao diện. Ba thứ này thay đổi vì ba lý do khác nhau và với nhịp khác nhau — nội dung sửa hàng ngày, scene sửa theo tuần, khung giao diện gần như không đổi. Trộn chúng lại nghĩa là mỗi lần sửa chính tả cũng phải động vào file chứa logic WebGL.',

    'Nguyên tắc thứ hai là **quản lý tài nguyên tập trung**. Nếu mỗi scene tự tải HDRI và model riêng, bạn sẽ tải trùng, không chia sẻ được cache, và không có chỗ nào để đặt màn hình loading tổng. Gom việc tải vào một tầng, các scene chỉ yêu cầu thứ chúng cần.',

    'Nguyên tắc thứ ba, đặc thù của R3F: **`useMemo` cho geometry và material dùng chung**. Nếu năm mươi vật thể cùng dùng một loại material, tạo năm mươi instance là năm mươi lần biên dịch shader và năm mươi mục trong bộ nhớ GPU. Một `useMemo` ở tầng trên giải quyết cả hai.',

    'Và đây là phép thử: **thêm một bài học mới hoàn toàn, rồi đếm số file phải sửa**. Nếu quá hai hoặc ba chỗ thì cấu trúc chưa đúng, hãy làm lại. Chính trang bạn đang đọc được xây theo nguyên tắc này — thêm một bài là thêm một file dữ liệu và một dòng đăng ký, không đụng tới trang hay component nào khác.',
  ],

  concepts: [
    {
      term: 'Tách ba tầng',
      explain:
        'Dữ liệu bài học / component scene 3D / component giao diện. Ba thứ thay đổi vì lý do khác nhau nên phải nằm ở chỗ khác nhau.',
    },
    {
      term: 'Tài nguyên tập trung',
      explain:
        'Một tầng lo việc tải và cache model, texture, HDRI. Scene chỉ yêu cầu, không tự tải. Nhờ vậy chia sẻ được cache và đặt được màn hình loading tổng.',
    },
    {
      term: 'useMemo cho tài nguyên chung',
      explain:
        'Geometry và material dùng ở nhiều nơi nên tạo một lần và chia sẻ. Mỗi material mới là một lần biên dịch shader và một mục trong VRAM.',
    },
    {
      term: 'Tránh biến toàn cục cho state scene',
      explain:
        'State toàn cục làm hai scene không chạy song song được, khó kiểm thử, và rò rỉ giữa các lần mount. Dùng store có phạm vi rõ ràng — nối tiếp bài 4.5.',
    },
    {
      term: 'Phép thử số file',
      explain:
        'Thêm một tính năng cùng loại và đếm số file phải sửa. Quá hai ba chỗ nghĩa là cấu trúc chưa đúng.',
    },
  ],

  walkthrough: [
    {
      action: 'Tách dữ liệu bài học ra thư mục riêng, mỗi bài một file, kèm type TypeScript chung.',
      why: 'Có type thì thêm bài mới được trình biên dịch nhắc thiếu trường nào — tài liệu sống, không cần ghi nhớ.',
    },
    {
      action: 'Đưa component 3D của từng bài vào thư mục riêng, đặt tên theo bài.',
      why: 'Scene là thứ nặng và có phụ thuộc riêng. Tách ra giúp chia nhỏ gói tải theo từng bài.',
    },
    {
      action: 'Gom component giao diện dùng chung — panel, danh sách, tooltip — vào một chỗ.',
      why: 'Nếu mỗi bài tự viết panel riêng thì đổi phong cách một lần phải sửa hai mươi chỗ.',
    },
    {
      action: 'Tạo một tầng tải tài nguyên tập trung, các scene chỉ yêu cầu.',
      why: 'Nếu hai bài cùng dùng một HDRI thì phải chỉ tải một lần. Đây cũng là chỗ đặt màn hình loading tổng.',
    },
    {
      action: 'Bọc geometry và material dùng chung trong `useMemo`.',
      why: 'Kiểm chứng bằng `gl.info.memory` — số geometry và program phải nhỏ hơn hẳn số vật thể.',
    },
    {
      action: 'Rà lại xem còn biến toàn cục nào giữ state scene không.',
      why: 'Chúng gây rò rỉ giữa các lần mount và làm việc kiểm thử gần như bất khả thi.',
    },
    {
      action: '**Thêm một bài học mới và đếm số file phải sửa.**',
      why: 'Đây là bài kiểm tra thật sự. Mọi thứ phía trên chỉ là phương tiện để con số này nhỏ.',
    },
  ],

  observations: [
    {
      change: 'Thêm một bài học mới vào cấu trúc hiện tại và đếm số file phải sửa.',
      observe: 'Trong cấu trúc tốt: một file dữ liệu mới, một dòng đăng ký. Trong cấu trúc kém: sửa trang, sửa điều hướng, sửa kiểu, sửa danh sách…',
      why: 'Con số này đo trực tiếp mức độ ghép nối của hệ thống. Mỗi chỗ phải sửa là một chỗ có thể quên, và số chỗ đó nhân lên theo số bài. Đây cũng là lý do trang này lưu nội dung dưới dạng **dữ liệu** thay vì JSX: thêm bài là thêm dữ liệu, không phải viết lại giao diện.',
    },
    {
      change: 'Tạo material mới bên trong component con thay vì `useMemo` ở tầng trên, rồi nhân bản component đó năm mươi lần.',
      observe: '`gl.info.programs` tăng vọt và lần render đầu bị khựng rõ.',
      why: 'Mỗi material là một lần biên dịch shader — thao tác đồng bộ và tốn kém. Three.js có cache theo cấu hình material, nhưng chỉ khi bạn tái sử dụng cùng một instance thì mới chắc chắn tránh được. Chia sẻ một material qua `useMemo` biến năm mươi lần biên dịch thành một.',
    },
    {
      change: 'Đặt state của scene vào một biến module ở cấp cao nhất, rồi mount hai scene cùng lúc.',
      observe: 'Hai scene giẫm lên state của nhau.',
      why: 'Biến ở cấp module là singleton dùng chung toàn ứng dụng. Nó cũng không được đặt lại khi component unmount, nên lần mount sau kế thừa state cũ — dạng lỗi rất khó tái hiện. Store có phạm vi rõ ràng, hoặc state cục bộ trong component, tránh được cả hai vấn đề.',
    },
    {
      change: 'Để mỗi scene tự tải HDRI của riêng nó thay vì qua tầng tài nguyên chung.',
      observe: 'Cùng một file được tải lại mỗi lần chuyển bài, và không có cách nào hiện tiến trình tổng.',
      why: 'Không có tầng chung thì không có chỗ nào biết toàn cảnh: cái gì đã tải, cái gì đang tải, tổng bao nhiêu. Đó là lý do màn hình loading tổng ở bài 3.2 chỉ khả thi khi việc tải được tập trung. Cache của `useGLTF` và `useTexture` giúp một phần, nhưng vẫn cần một tầng để điều phối và preload.',
    },
  ],

  interview: [
    {
      q: 'Bạn tổ chức một dự án Three.js lớn thế nào?',
      a: 'Tôi tách ba tầng: dữ liệu nội dung, component scene 3D, và component giao diện — vì ba thứ này thay đổi vì lý do khác nhau và với nhịp khác nhau. Việc tải tài nguyên gom vào một tầng để chia sẻ cache và có một điểm duy nhất theo dõi tiến trình. Geometry và material dùng chung được tạo một lần rồi chia sẻ, tránh biên dịch shader lặp lại. State scene dùng store có phạm vi rõ ràng thay vì biến toàn cục. Phép thử tôi dùng là: thêm một tính năng cùng loại rồi đếm số file phải sửa — quá hai ba chỗ là cấu trúc có vấn đề.',
    },
    {
      q: 'Vì sao chia sẻ material lại quan trọng?',
      a: 'Vì mỗi material tương ứng một chương trình shader phải biên dịch, và việc biên dịch là đồng bộ nên gây khựng ở khung hình đầu tiên vật thể xuất hiện. Nó cũng chiếm mục riêng trong bộ nhớ GPU. Với năm mươi vật thể cùng loại, chia sẻ một instance biến năm mươi lần biên dịch thành một. Cách kiểm chứng là so `gl.info.programs` với số vật thể — chênh lệch lớn là dấu hiệu tốt.',
    },
    {
      q: 'Vì sao tránh biến toàn cục cho state của scene?',
      a: 'Ba lý do. Nó là singleton nên hai scene không thể chạy song song với state riêng. Nó không được đặt lại khi unmount nên lần mount sau kế thừa trạng thái cũ — loại lỗi rất khó tái hiện vì phụ thuộc vào thứ tự thao tác. Và nó khiến kiểm thử gần như bất khả thi vì mỗi test làm ô nhiễm test sau. Store có phạm vi rõ ràng hoặc state cục bộ giải quyết cả ba.',
    },
    {
      q: 'Làm sao chia nhỏ gói tải cho ứng dụng 3D nhiều scene?',
      a: 'Dùng `React.lazy` cho từng component scene để mã của scene chưa xem không nằm trong gói ban đầu. Three.js nên import theo tên cụ thể thay vì `import * as THREE` để tree-shaking hoạt động, và các addon vốn đã tách sẵn theo file. Tài nguyên thì tải theo nhu cầu kèm preload có chọn lọc — ví dụ preload scene kế tiếp khi người dùng đang xem scene hiện tại. Bộ giải mã Draco và KTX2 cũng nên tải động, chỉ khi thực sự gặp file cần chúng.',
    },
  ],

  checkpoints: [
    'Thêm bài học mới chỉ cần sửa một hoặc hai chỗ.',
    'Không còn biến toàn cục nào giữ state của scene.',
    'Geometry và material dùng chung được tạo một lần.',
    'Việc tải tài nguyên đi qua một tầng duy nhất.',
  ],
};
