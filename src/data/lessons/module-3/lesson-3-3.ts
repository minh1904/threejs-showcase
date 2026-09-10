import type { LessonContent } from '../types';

export const LESSON_3_3: LessonContent = {
  id: '3-3',

  goal: 'Có bảng số liệu của chính bạn về dung lượng và thời gian tải trước/sau khi nén — để khi phỏng vấn hỏi về tối ưu glTF, bạn đưa ra con số thật thay vì lý thuyết.',

  lecture: [
    'Bài này không có sandbox, vì công việc thật diễn ra ở dòng lệnh. Đổi lại nó là bài cho bạn thứ dễ ghi điểm nhất khi phỏng vấn: một bảng số liệu do chính bạn đo.',

    'Có hai loại nén hoàn toàn khác nhau và người mới hay lẫn lộn. **Nén hình học** — Draco hoặc Meshopt — làm nhỏ dữ liệu đỉnh trong file. **Nén texture** — KTX2/Basis — làm nhỏ ảnh. Chúng giải quyết hai vấn đề khác nhau và thường phải dùng cả hai.',

    'Điểm mấu chốt của nén hình học là nó chỉ có tác dụng **khi truyền**. Draco có thể làm file nhỏ đi năm tới mười lần, nhưng ngay khi tải xong, dữ liệu phải được giải nén trở lại dạng đầy đủ để nạp lên GPU. Bạn tiết kiệm băng thông và thời gian tải, đổi lấy một khoảng CPU để giải nén. Với mạng chậm thì luôn lãi; với model nhỏ trên mạng nhanh thì có khi lỗ.',

    'Nén texture thì khác về bản chất, và đây là chỗ nhiều người bỏ lỡ. KTX2/Basis giữ trạng thái nén **ngay trong VRAM**. Một ảnh JPG dù chỉ nặng 200KB trên đĩa, khi tải lên GPU vẫn bị giải nén hoàn toàn thành khoảng 16MB cho ảnh 2048×2048. KTX2 thì GPU đọc trực tiếp định dạng nén, nên tiết kiệm cả bộ nhớ lẫn băng thông bộ nhớ lúc chạy. Đây là khác biệt quan trọng nhất của bài, và cũng là điều phân biệt người đã làm thật với người mới đọc tài liệu.',

    'Công cụ bạn cần là `gltf-transform`. Nó chạy trực tiếp qua `bunx`, không cần cài đặt gì, và làm được toàn bộ quy trình nén. Hãy đo cẩn thận từng bước và ghi vào bảng — đó là sản phẩm của bài này.',
  ],

  concepts: [
    {
      term: 'Draco',
      explain:
        'Nén hình học của Google. Tỉ lệ nén rất cao nhưng giải nén tốn CPU đáng kể. Cần `DRACOLoader` kèm `setDecoderPath()` trỏ tới thư mục chứa bộ giải mã.',
    },
    {
      term: 'Meshopt',
      explain:
        'Lựa chọn thay thế Draco. Tỉ lệ nén thấp hơn một chút nhưng giải nén **nhanh hơn nhiều lần** và bộ giải mã nhẹ hơn. Thường là lựa chọn tốt hơn cho web.',
    },
    {
      term: 'KTX2 / Basis',
      explain:
        'Nén texture cho GPU. Khác biệt cốt lõi: dữ liệu **giữ nguyên trạng thái nén trong VRAM**, trong khi JPG/PNG bị giải nén hoàn toàn khi tải lên. Tiết kiệm bộ nhớ GPU nhiều lần.',
    },
    {
      term: 'gltf-transform',
      explain:
        'Công cụ dòng lệnh xử lý glTF: nén, đổi kích thước texture, gộp mesh, loại bỏ dữ liệu thừa. Chạy bằng `bunx @gltf-transform/cli`.',
    },
    {
      term: 'Đánh đổi',
      explain:
        'Nén hình học đổi băng thông lấy CPU. Nén texture thì gần như lãi thuần — vừa giảm dung lượng tải vừa giảm VRAM.',
    },
  ],

  walkthrough: [
    {
      action: 'Chạy `bunx @gltf-transform/cli --help` để xem danh sách lệnh.',
      why: 'Không cần cài đặt gì. Hãy lướt qua danh sách để biết công cụ này còn làm được gì ngoài nén.',
    },
    {
      action: 'Ghi lại dung lượng file gốc, và chạy `gltf-transform inspect input.glb`.',
      why: 'Lệnh `inspect` cho biết số mesh, số đỉnh, danh sách texture kèm kích thước — bạn cần biết vấn đề nằm ở hình học hay ở texture trước khi chọn cách nén.',
    },
    {
      action: 'Nén hình học: `gltf-transform draco input.glb draco.glb`. Ghi lại dung lượng mới.',
      why: 'So sánh với con số gốc để biết hình học chiếm bao nhiêu phần trong file của bạn.',
    },
    {
      action: 'Thử luôn `gltf-transform meshopt input.glb meshopt.glb` và so sánh cả hai.',
      why: 'Con số cụ thể sẽ cho bạn cơ sở để chọn, thay vì theo cảm tính hay theo bài viết trên mạng.',
    },
    {
      action: 'Nén texture: `gltf-transform etc1s draco.glb final.glb` (hoặc `uastc` nếu cần chất lượng cao hơn).',
      why: '`etc1s` cho dung lượng nhỏ hơn nhiều, `uastc` giữ chất lượng tốt hơn cho normal map. Thường dùng `etc1s` cho map màu và `uastc` cho map dữ liệu.',
    },
    {
      action: 'Cấu hình `GLTFLoader` với `DRACOLoader` và `KTX2Loader`, nhớ gọi `setDecoderPath()` và `detectSupport(renderer)`.',
      why: 'Đây là bước hay quên. Thiếu decoder path thì file nén không load được, và thông báo lỗi không nói rõ nguyên nhân.',
    },
    {
      action: 'Đo thời gian tải bằng `performance.now()` trước và sau, với Network throttling ở "Fast 3G".',
      why: 'Đo trên mạng nội bộ thì mọi phiên bản đều nhanh như nhau và bạn không học được gì.',
    },
  ],

  observations: [
    {
      change: 'So sánh dung lượng file sau khi nén Draco với file gốc.',
      observe: 'Thường nhỏ đi nhiều lần nếu model nhiều đa giác.',
      why: 'Draco mã hoá lại dữ liệu đỉnh bằng cách lượng tử hoá toạ độ và nén cấu trúc liên kết giữa các tam giác. Mức lãi phụ thuộc mạnh vào tỉ lệ hình học trong file: model nhiều đa giác mà ít texture thì lãi lớn, còn model đơn giản gắn texture 4K thì gần như không đổi — lúc đó vấn đề nằm ở texture chứ không phải hình học.',
    },
    {
      change: 'Đo thời gian từ lúc bắt đầu tải tới lúc model xuất hiện, cho cả bản gốc và bản Draco, trên "Fast 3G".',
      observe: 'Bản Draco tải nhanh hơn rõ rệt, nhưng có thêm một khoảng trễ trước khi model hiện ra.',
      why: 'Đó chính là thời gian giải nén trên CPU. Tổng thời gian vẫn thường có lợi trên mạng chậm, nhưng trên mạng nhanh và với model nhỏ thì phần giải nén có thể lấn át phần tiết kiệm được. Đây là lúc Meshopt sáng giá hơn: nén ít hơn một chút nhưng giải nén nhanh hơn nhiều lần.',
    },
    {
      change: 'Theo dõi `renderer.info.memory.textures` và bộ nhớ GPU với texture JPG so với KTX2.',
      observe: 'KTX2 chiếm ít VRAM hơn hẳn, dù dung lượng file trên đĩa có khi không chênh nhiều.',
      why: 'Đây là điểm mấu chốt mà nhiều người bỏ lỡ. JPG và PNG được giải nén **hoàn toàn** khi tải lên GPU — một ảnh 2048×2048 chiếm khoảng 16MB VRAM bất kể file gốc nặng bao nhiêu. KTX2/Basis dùng định dạng mà GPU đọc trực tiếp ở trạng thái nén, nên vừa tiết kiệm bộ nhớ vừa giảm băng thông khi lấy mẫu. Trên di động, đây thường là khoản tối ưu đáng giá nhất.',
    },
    {
      change: 'Quên gọi `dracoLoader.setDecoderPath()` rồi load file đã nén Draco.',
      observe: 'Load thất bại với thông báo lỗi khó hiểu.',
      why: 'Bộ giải mã Draco là một module WebAssembly riêng, không đóng gói sẵn trong Three.js vì nó nặng và không phải ai cũng cần. Bạn phải chép thư mục `draco/` từ `three/examples/jsm/libs/` vào `public/` rồi trỏ đường dẫn tới đó. Đây là lỗi hay gặp nhất khi triển khai, vì nó thường chỉ lộ ra trên môi trường production nơi cấu trúc thư mục khác với lúc phát triển.',
    },
  ],

  interview: [
    {
      q: 'Draco nén cái gì và đánh đổi ra sao?',
      a: 'Nó nén dữ liệu hình học — toạ độ đỉnh, pháp tuyến, UV và cấu trúc liên kết tam giác — bằng cách lượng tử hoá và mã hoá lại. Tỉ lệ nén rất cao với model nhiều đa giác. Đánh đổi là dữ liệu phải được giải nén trên CPU sau khi tải, nên có thêm độ trễ trước khi model hiện ra, và bạn phải kèm theo bộ giải mã WebAssembly. Trên mạng chậm thì gần như luôn lãi; với model nhỏ trên mạng nhanh thì có khi lỗ.',
    },
    {
      q: 'Vì sao KTX2 quan trọng hơn người ta tưởng?',
      a: 'Vì nó là loại nén duy nhất còn tác dụng **sau khi** tải xong. JPG và PNG được giải nén hoàn toàn khi nạp lên GPU, nên một ảnh 2048×2048 luôn chiếm khoảng 16MB VRAM dù file gốc chỉ 200KB. KTX2/Basis dùng định dạng nén mà phần cứng đọc trực tiếp, nên tiết kiệm cả bộ nhớ GPU lẫn băng thông khi lấy mẫu. Với thiết bị di động vốn giới hạn VRAM, đây thường là khoản tối ưu có tác động lớn nhất.',
    },
    {
      q: 'Chọn Draco hay Meshopt?',
      a: 'Meshopt trong đa số trường hợp web. Nó nén kém hơn Draco một chút nhưng giải nén nhanh hơn nhiều lần và bộ giải mã nhẹ hơn đáng kể, nên tổng thời gian từ lúc bắt đầu tải tới lúc hiển thị thường tốt hơn. Draco đáng chọn khi băng thông là nút thắt tuyệt đối — model rất lớn, người dùng ở vùng mạng yếu — và bạn chấp nhận thêm độ trễ CPU.',
    },
    {
      q: 'Quy trình tối ưu một model glTF của bạn gồm những bước gì?',
      a: 'Bắt đầu bằng `gltf-transform inspect` để biết dung lượng nằm ở đâu — hình học hay texture. Sau đó dọn dẹp: `prune` bỏ node và material không dùng, `dedup` gộp dữ liệu trùng. Rồi giảm kích thước texture về mức thật sự cần theo diện tích vật thể trên màn hình, và nén sang KTX2. Cuối cùng mới nén hình học bằng Meshopt hoặc Draco. Đo lại sau mỗi bước — thứ tự này quan trọng vì việc dọn dẹp trước sẽ làm các bước nén sau hiệu quả hơn.',
    },
  ],

  checkpoints: [
    'Có bảng so sánh dung lượng và thời gian tải cho bản gốc, Draco, và Draco + KTX2.',
    'Giải thích được vì sao KTX2 tiết kiệm cả VRAM chứ không chỉ băng thông.',
    'Load được file đã nén, có cấu hình `setDecoderPath()` đúng.',
    'Nói được khi nào chọn Meshopt thay vì Draco.',
  ],
};
