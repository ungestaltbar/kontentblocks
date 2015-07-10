var Check = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<span class="dashicons dashicons-format-image"></span>');
    if (this.isValid()) {
      this.render();
    }
  },
  className: 'kb-inline-control',
  events: {
    'click': 'openFrame'
  },
  openFrame: function () {
    this.Parent.openFrame();
  },
  render: function () {
    this.Parent.parentView.$el.append(this.$el);
    this.$el.hide();
  },
  show: function () {
    this.$el.show();
    var off = this.Parent.$el.offset();
    var w = this.Parent.$el.width();
    off.left = off.left + w - 40;
    off.top = off.top + 20;
    this.$el.offset(off);
  },
  hide: function () {
    this.$el.hide();
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  }
});