var KB = KB || {};
KB.Ext = KB.Ext || {};

KB.Ext.Backup = (function($) {

    return {
        el: $('#backup-inspect'),
        init: function() {
            this.listEl = $('<ul></ul>').appendTo(this.el);
            if (this.listEl.length > 0) {
                this.update();
            }
        },
        update: function() {
            var that = this;


            KB.ajax(
                    {
                        action: 'get_backups'
                    },
            function(response)
            {
                that.items = response;
                that.renderList(response);
            });

        },
        renderList: function(items) {
            var that = this;


            this.listEl.empty();
            _.each(items, function(item, key) {
                that.listEl.append(_.template("\
                <li>\n\
                    <details>\n\
                        <summary>\n\
                            <%= data.time %>\n\
                        </summary>\n\
                    <div class='actions' data-id='<%= key %>'>\n\
                        <span class='js-review'>Review</span>\n\
                        <span class='js-restore'>Restore</span>\n\
                        <p class='description'><b>Comment:</b> <%= item.msg %></p>\n\
                    </details>\n\
                </li>", {data: {time: new moment.unix(key).format('HH:mm:ss / DD.MMM')}, item: item, key: key}))
            });

            this.listEl.on('click', '.js-restore', function(e) {
                var id = $(this).parent().attr('data-id');
                that.restore(id);
            })
        },
        restore: function(id) {
            var that = this;
            var location = window.location.href + '&restore_backup=' + id + '&post_id=' + $('#post_ID').val();
            window.location = location;
        }



    };


}(jQuery));
KB.Ext.Backup.init();
var KBAreaSelector;

(function($) {


    KBAreaSelector =
            {
                init: function()
                {
                    $('#existing-areas, #active-dynamic-areas').sortable({
                        connectWith: '.connect',
                        cancel: "li.ui-state-disabled",
                        placeholder: "sortable-placeholder",
                        helper: "clone",
                        receive: function(event, ui)
                        {
                            item = ui.item;
                            id = $(item).attr('id');

                            $(item).toggleClass('dynamic-area-active');

                            if (this.id == 'active-dynamic-areas')
                            {
                                action = "<span><a href=''>edit</a></span>";

                                content = "<input id='" + id + "_hidden' type='hidden' name='active_sidebar_areas[]' value='" + id + "' />";
                                $(item).append(content);
                            }
                            else
                            {
                                $('input#' + id + '_hidden').remove();

                            }
                        }
                    })
                }

            }


    $(document).ready(KBAreaSelector.init);
})(jQuery);


jQuery(document).ready(function($) {

    $("body").on('click', 'a.da-modal', function(e) {
        e.preventDefault();

        target = $(this).attr('data-url');
        height = $(window).height();
        $('#da-frame').attr('src', target).attr('height', height - 200);
        
        $(window).resize(function() {
            height = $(window).height();
            $('#da-frame').attr('height', height - 200);
        });
        var $content = $('#da-modal');
        openedModal = vex.open({
            content: $content.html(),
            contentClassName: 'editGlobalArea'
        });

    });

});
var KBCopyMove, post_id;

(function($){
	
	KBCopyMove = 
	{
    
	    data: {
		class : '',
		instance_id : '',
		payload : {}
	    },
	
	    init: function() {
		    $('.kb-copymove').live('click', function(e) {
			e.preventDefault();

			

			KBCopyMove.data.instance_id  = activeBlock;
			KBCopyMove.data.class	= $('#' + activeBlock).attr('data-blockclass');


			$('#kb-copymove').reveal({
			    open : function(){ open: KBCopyMove.modalOpen(); }
			});
		    });
		    
		    $('#kb-copymove').on('click', '.kb-copymove-send', function(e){
			e.preventDefault();
			KBCopyMove.copy();
		    })
		    
		    $('#kb-copymove').on('click', '.copymove-back', function(e){
			e.preventDefault();
			KBCopyMove.prevSlide();
		    });
		    
		     $('#kb-copymove').on('change', 'select', function(){

			getwhat = $(this).parent().attr('rel');
			value = $(this).val();


			if ( value === '')
			    return false;
			
			$section = $(this).closest('.copymove-section').toggleClass('loading');

			KBCopyMove.data.payload[getwhat] = value;


			KB.ajax({
			    type	: getwhat,
			    value	: value,
			    payload	: KBCopyMove.data.payload,
			    'action'	: 'copymove_get_'+ getwhat
			}, function(res){

			   $('#copymove_'+ getwhat).empty();
			  // $('#copymove_'+ getwhat).append('<option>select one</option>');
			   $('#copymove_'+ getwhat).html(res);
			    $($section).closest('.copymove-section').toggleClass('loading');
			    
			    KBCopyMove.nextSlide();
				});
			});
	    },
	    
	    modalOpen: function() {
		
		    
		
		    KB.ajax(
		    {
			    action:'kb_copymove',
			    data: KBCopyMove.data,
			    post_id: $('#post_ID').val()
		    }, 
		    function(response) 
		    {
			   $('#kb-copymove').html(response);
			   
		    });
		
		
	    },
	    
	    copy: function() {
		    KB.ajax(
		    {
			    action:'kb_copymove_copy',
			    data: KBCopyMove.data,
			    post_id: $('#post_ID').val()
		    }, 
		    function(response) 
		    {
			console.log(response);
			   //$('#kb-copymove').html(response);
			   
		    });		
	    },
	    
	    nextSlide: function() {
		
		var container = $('.copymove-wrapper');
		
		$(container).find('.holder').animate({top : '-=130px'}, 350);
		
	    },
		    
	    prevSlide: function() {
		
		var container = $('.copymove-wrapper');
		
		$(container).find('.holder').animate({top : '+=130px'}, 350);
		
	    }
	    
	};
	
	$(document).ready( KBCopyMove.init );
})(jQuery);
var KBProxy;

(function($){
	
	KBProxy = 
	{
	
	    
	    init: function() 
		    {
			
			var $this = KBProxy;
			var payload = {};
			
			 $(kbMetaBox).on('click', '.proxy-toggle', function(){
			     $(this).next().slideToggle(750);
			 });
			
			 $(kbMetaBox).on('change', '.block-select', function(){
			    $('#'+activeBlock+'_block_chosen').val($(this).val());
			    $('#'+activeBlock+'_select_block').removeAttr('disabled');
			    })
			    
			 $(kbMetaBox).on('click', '.proxy-select-block', function(){
			     $this.result(payload);
			 })
			
			 $(kbMetaBox).on('change', '.proxy-select', function(){
  
				getwhat = $(this).attr('rel');
				value = $(this).val();
				
				$section = $(this).closest('.proxy-section').toggleClass('loading');

				payload[getwhat] = value;

				KB.ajax({
				    payload	: payload,
				    type		: getwhat,
				    value	: value,
				    'action'	: 'proxy_get_'+ getwhat
				}, function(res){

				    $('#'+activeBlock+'_'+ getwhat).empty();
				    $('#'+activeBlock+'_'+ getwhat).append('<option>select one</option>');
				    $('#'+activeBlock+'_'+ getwhat).append(res);
				    $($section).closest('.proxy-section').toggleClass('loading');

					});
				})
		    },
		    
	    result: function(payload)
		    {
				KB.ajax({
				    payload	: payload,
				    'action'	: 'proxy_get_result'
				}, function(res){

				    result = res;
				    
				    container = $('#'+activeBlock+'_proxy_result');
				    holder = $('#'+activeBlock).find('.holder');
				    $(container).empty().append(result.html);
				    $(holder).slideToggle(750);
					});
		    }	    			
	}
	
	$(document).ready( KBProxy.init );
})(jQuery);
(function($) {

    var LayoutTemplates = {
        el: $('#layout-templates'),
        init: function() {
            
            if (this.el.length === 0) {
                return false;
            }

            this.options = {};
            this.areaConfig = this._areaConfig();
            this.selectContainer = this._selectContainer();
            this.selectMenuEl = this._createSelectMenu();
            this.loadButton = this._loadButton();
            this.deleteButton = this._deleteButton();
            this.createContainer = this._createContainer();
            this.createInput = this._createInput();
            this.createButton = this._createButton();

            this.update();
        },
        _selectContainer: function() {
            return $("<div class='select-container'></div>").appendTo(this.el);
        },
        _createSelectMenu: function() {
            $('<select name="layout-template"></select>').appendTo(this.selectContainer);
            return $('select', this.el);
        },
        update: function() {
            var that = this;


            KB.ajax(
                    {
                        action: 'get_layout_templates',
                        data: {
                            areaConfig: this.areaConfig
                        }
                    },
            function(response)
            {
                that.options = response;
                that.renderSelectMenu(response);
            });

        },
        save: function() {
            var that = this;
            var value = this.createInput.val();

            if (_.isEmpty(value)) {
                KB.notice('Please enter a Name for the template', 'error');
                return false;
            }

            KB.ajax(
                    {
                        action: 'set_layout_template',
                        data: {
                            areaConfig: this.areaConfig,
                            name: value
                        }
                    },
            function(response)
            {
                that.update();
                that.createInput.val('');
                KB.notice('Saved', 'success');
            });

        },
        delete: function() {
            var that = this;
            var value = this.selectMenuEl.val();

            if (_.isEmpty(value)) {
                KB.notice('Please chose a template to delete', 'error');
                return false;
            }

            KB.ajax(
                    {
                        action: 'delete_layout_template',
                        data: {
                            areaConfig: this.areaConfig,
                            name: value
                        }
                    },
            function(response)
            {
                that.update();
                KB.notice('Saved', 'success');
            });

        },
        renderSelectMenu: function(data) {
            var that = this;
            that.selectMenuEl.empty();
            _.each(data, function(item, key, s) {
                that.selectMenuEl.append(_.template("<option value='<%= data.key %>'><%= data.name %></option>", {data: {
                        key: key,
                        name: item.name
                    }}));
            });
        },
        _areaConfig: function() {

            var concat = '';

            if (KB.RawAreas) {
                _.each(KB.RawAreas, function(context) {
                    concat += context.id;
                    console.log(concat);
                });
            }
            return this.hash(concat.replace(',', ''));
        },
        hash: function(s) {
            return s.split("").reduce(function(a, b) {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a
            }, 0);

        },
        _createContainer: function() {
            return ($("<div class='create-container'></div>").appendTo(this.el));
        },
        _createInput: function() {
            return $("<input type='text' >").appendTo(this.createContainer);
        },
        _createButton: function() {
            var that = this;
            var button = $("<a class='button'>Save</a>").appendTo(this.createContainer);
            button.on('click', function(e) {
                e.preventDefault();
                that.save();
            })
            return button;
        },
        _loadButton: function() {
            var that = this;
            var button = $("<a class='button'>Load</a>").appendTo(this.selectContainer);
            button.on('click', function(e) {
                e.preventDefault();
                that.load();
            })
            return button;
        },
        _deleteButton: function() {
            var that = this;
            var button = $("<a class='delete-js'>delete</a>").appendTo(this.selectContainer);
            button.on('click', function(e) {
                e.preventDefault();
                that.delete();
            })
            return button;
        },
        load: function() {
            var location = window.location.href + '&load_template=' + this.selectMenuEl.val() + '&post_id=' + $('#post_ID').val() + '&config=' + this.areaConfig;
            window.location = location;
        }

    };

    LayoutTemplates.init();

}(jQuery));