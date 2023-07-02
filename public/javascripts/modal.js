$(document).ready(function() {
  // modal ok or cancel
  // useage: button.btn.btn-danger.btn-raised(type='button', data-toggle='modal', data-target='#modal-ok-cancel', data-modal-title='delete?', data-modal-body='user name: #{target_user.name}', data-modal-submit='#delete-user') delete
  //  - data-modal-title: モーダルのタイトル
  //  - data-modal-body: モーダルの本文
  //  - data-modal-submit: OK 時に実行する form id
  $('#modal-ok-cancel').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var modal = $(this);
    var modal_title = button.data('modal-title');
    var modal_body = button.data('modal-body');
    var modal_submit = button.data('modal-submit');
    modal.find('.modal-title').text( modal_title );
    modal.find('.modal-body').text( modal_body );
    $('#modal-ok-cancel-ok').attr('modal-submit', modal_submit);
    modal.modal('show');
  });
  $('#modal-ok-cancel-ok').click(function() {
    var button = $(this);
    $(button.attr('modal-submit')).submit();
  });
});
