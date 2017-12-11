var TMS = {
	
	cleanUp : function(){
		TMS.dictionary.clear();
		$('#search_results').html($(''));
	},
	
	/***************************************************************************
	 * 
	 * Initialization of container
	 * 
	 **************************************************************************/
	
	init : function(container) {

		var spinnerImg = $('<img>').attr('src', 'http://terminologies.gfbio.org/openSocialGadget/spinner.gif').attr('id',
				'spinner_image');

		var searchResults = $('<div>').attr('id', 'search_results');

		$('#' + container).append(spinnerImg);
		$('#' + container).append(searchResults);
		spinnerImg.hide();

	},

	/***************************************************************************
	 * 
	 * Dictionary
	 * 
	 **************************************************************************/

	dictionary : {
		domains : [],
		getDomain : function(domainName) {
			for (var i = 0; i < TMS.dictionary.domains.length; i++) {
				if (TMS.dictionary.domains[i].name == domainName) {
					return TMS.dictionary.domains[i];
				}
			}
			return null;
		},
		addDomain : function(domainName, results) {
			this.domains.push({
				"name" : domainName,
				"results" : [ results ]
			});
		},
		clear : function() {
			this.domains = [];
		}
	},


    openDetails : function (sourceTerminology, uri) {
        if (uri == null || sourceTerminology == null) {
            // sourceTerminology = 'CHEBI';
            // uri = 'http://purl.obolibrary.org/obo/CHEBI_27841';
			alert('error');
        }
        window.open("termDetails/termDetails.html?terminology=" + sourceTerminology + "&uri=" + encodeURI(uri), "_blank", "", false);
    },

	/***************************************************************************
	 * 
	 * Create Result from Data
	 * 
	 **************************************************************************/
	createResult : function(data) {
		if (data) {
			// add data to dictionary
			$.each(data.results, function() {
				if (!this.domain) {
					this.domain = "Uncategorized";
				}

				var domain = TMS.dictionary.getDomain(this.domain);
				if (domain == null) {
					TMS.dictionary.addDomain(this.domain, this);
				} else {
					domain.results.push(this);
				}

                // console.log(domain);

            });
		}
		$('#spinner_image').hide();

		$('#search_results').show();
		var j = 0;
		$.each(TMS.dictionary.domains, function(indexj, domain) {
			$.each(this.results, function(indexi, result) {
				var div = $('<div>');
				var terminology = result.sourceTerminology;

				if(terminology.startsWith('DTNtaxonlists_SNSB')){
                    terminology += "-" + result.embeddedDatabase;
				}

                var termLabel = $('<a>')
                    .attr('onClick', 'TMS.openDetails("'+terminology+'", "'+result.uri+'");')
					.attr('class','termLabel')
                    .attr('target','_blank')
                    .data('conceptID',result.uri)
                    .data('terminologyID',terminology)
                    .text(result.label);

                var sourceTerminology = $('<span>')
					.text(result.sourceTerminology)
					.attr('class','sourceTerminology');

                var label_headline = $('<div>')
					.attr('id','headline')
					.append(termLabel)
					.append(sourceTerminology);

				var uri = $('<a>')
					.attr('href',result.uri)
					.attr('class','uri') //id=uri ?
					.attr('target','_blank')
					.text(result.uri);
				
				var infobutton = $('<button>')
					.attr('type','button')
					.attr('id','infobutton' + j)
					.data('conceptID',result.uri)
					.data('terminologyID',result.sourceTerminology)
					.css('margin-left','25px')
					.css('background','#F6F6F6 !important');
				
				j++;

				if (result.uri){
					label_headline
					.append('<br>').append(uri);
				}
					
				var infobox = $('<div>')
					.append(label_headline)
                    .attr('class','infobox');

				infobox
					.append('<br>')
					.append(div);

				var hr = $('<hr>');

                $('#search_results')
					.append(infobox)
					.append(hr);

				TMS.createInfo(div, result);

			});// end of result iteration
			$('button').button({
				icons: {primary:'ui-icon-search'},
				text: false
			});
		});
	},
	
	/***************************************************************************
	 * 
	 * Perform Search
	 * 
	 **************************************************************************/
	performSearch : function(searchquery, searchType, searchTerminology) {
	
		var restfulws_url = 'https://terminologies.gfbio.org/api/terminologies/search';
		$('#spinner_image').show();
		// delete the recent values from the dictionary
		TMS.dictionary.clear();
		// remove the recent values
		$('#search_results').html($(''));

		var internal_only = searchTerminology != 'external';
        var match_type = searchType == 'exact' ? searchType : 'included';

        $.getJSON(restfulws_url, {
            query : searchquery,
            match_type : match_type,
            internal_only : internal_only
        }, TMS.createResult);

		// if (searchType == 'exact'){
		// 	$.getJSON(restfulws_url, {
		// 		query : searchquery,
		// 		match_type : searchType,
         //        internal_only : internal_only
         //    }, TMS.createResult)
		// }else {
		// 	$.getJSON(restfulws_url, {
		// 		query : searchquery,
         //        match_type : searchType, //<------ that's the problem!
         //        internal_only : internal_only
		// 	}, TMS.createResult)
		// }
	},

	createInfo : function(div, result){
		if(result.sourceTerminology.startsWith('DTNtaxonlists_SNSB') && result.embeddedDatabase){
            var embedded = $('<div>')
                .append($('<span>').attr('class', 'property').text('Embedded Database:'))
                .append($('<span>').text(result.embeddedDatabase));
            $(div).append(embedded);
		}

        if (result.description){
            var description = $('<div>')
					.append($('<span>').attr('class', 'property').text('Description:'))
                	.append($('<span>').text(result.description));
            $(div).append(description);
        }

        if(result.synonyms){
            var synonyms = $('<div>')
				.append($('<span>').attr('class', 'property').text('Synonyms:'));
            var data = result.synonyms;

            for(var i=0; i<data.length;i++){
            	var divider = "";
            	if(i!=0){
                    divider = ", ";
				}
				synonyms.append($('<span>').text(divider + data[i]));
			}

            $(div).append(synonyms);
        }

        if (result.externalID){
            var externalID = $('<div>')
				.append($('<span>').attr('class', 'property').text('External ID:'))
                .append($('<span>').text(result.externalID));
            $(div).append(externalID);
        }

        if (result.rank){
            var rank = $('<div>')
				.append($('<span>').attr('class', 'property').text('Rank:'))
				.append($('<span>').text(result.rank));
            $(div).append(rank);
        }

        if (result.kingdom){
            var kingdom = $('<div>')
                .append($('<span>').attr('class', 'property').text('Kingdom:'))
				.append($('<span>').text(result.kingdom));
            $(div).append(kingdom);
        }

        if (result.status){
            var status = $('<div>')
				.append($('<span>').attr('class', 'property').text('Status:'))
				.append($('<span>').text(result.status));
            $(div).append(status);
        }
	},
	
	// createTable : function(table, result) {
    //
	// 	if (result['label']){
	// 		var label = $('<tr>').append(
	// 				$('<td>').text('Label'))
	// 				.append($('<td>').text(result.label));
	// 		$(table).append(label);
	// 	}
	//
	// 	if (result['description']){
	// 		var description = $('<tr>').append($('<td>').text('Description'))
	// 		.append($('<td>').text(result.description));
    //
	// 		$(table).append(description);
	// 	}
	//
	// 	if (result['externalID']){
	// 		var externalID = $('<tr>').append(
	// 				$('<td>').text('External ID'))
	// 				.append(
	// 						$('<td>').text(result.externalID));
	// 		$(table).append(externalID);
	// 	}
	//
	// 	if (result['rank']){
	// 		var rank = $('<tr>').append(
	// 				$('<td>').text('Rank')).append(
	// 						$('<td>').text(result.rank));
	// 		$(table).append(rank);
	// 	}
	//
	// 	if (result['kingdom']){
	// 		var kingdom = $('<tr>')
	// 		.append(
	// 				$('<td>').text('Kingdom')).append(
	// 				$('<td>').text(result.kingdom));
	// 		$(table).append(kingdom);
	// 	}
	//
	// 	if (result['status']){
	// 		var status = $('<tr>').append(
	// 				$('<td>').text('Status')).append(
	// 						$('<td>').text(result.status));
	// 		$(table).append(status);
	// 	}
	// }
	
};
