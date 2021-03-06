var Tether = require('tether');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-inline-toolbar',
  attributes: function () {
    return {
      'data-kbelrel': this.model.get('baseId'),
      'hidefocus': '1',
      'tabindex': '-1'
    };
  },
  initialize: function (options) {
    this.options = options;
    this.FieldControlView = options.FieldControlView;
    this.controls = options.controls || [];
    this.hidden = false;
    this.listenTo(this.model, 'field.model.dirty', this.getDirty);
    this.listenTo(this.model, 'field.model.clean', this.getClean);
    this.listenTo(this.FieldControlView, 'field.view.derender', this.derender);
    this.listenTo(this.FieldControlView, 'field.view.rerender', this.rerender);
    this.listenTo(this.FieldControlView, 'field.view.gone', this.derender);
    this.create();
  },
  create: function () {
    var that = this;
    _.each(this.controls, function (control) {
      if (control.isValid()){
        control.render().appendTo(that.$el);
        control.Toolbar = that;
      }
    });
    this.$el.appendTo('body');
    this.createPosition();
  },
  hide: function(){
    this.$el.hide();
    this.hidden = true;
  },
  show: function(){
    if (this.hidden){
      this.$el.show();
    }
  },
  createPosition: function () {
    var tether = this.options.tether || {};
    var settings = {
      element: this.$el,
      target: this.FieldControlView.$el,
      attachment: 'center right',
      targetAttachment: 'center right'
    };
    this.Tether = new Tether(
      _.defaults(settings, tether)
    );
  },
  getDirty: function () {
    this.$el.addClass('isDirty');
  },
  getClean: function () {
    this.$el.removeClass('isDirty');
  },
  derender: function () {
    if (this.Tether) {
      this.Tether.destroy();
      delete this.Tether;
    }
  },
  rerender: function () {
    this.createPosition();
  },
  getTetherDefaults: function () {
    var att = this.el;
    var target = this.FieldControlView.el;
    return _.defaults(tether, {
      element: att,
      target: target,
      attachment: 'center right',
      targetAttachment: 'center right'
    });
  }

});