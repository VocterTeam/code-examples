<template>
	<div class="qna-widget">
		<!-- body -->
		<div class="qna-block body"
			:class="{
				'body--registered': isUserRegistered,
				'body--editing': editingPersonInfo}">
			<ul class="qna-list" v-if="qnaItems.length">
				<li class="qna-list__item" v-for="qna in qnaItems">
					<!-- qna-header -->
					<div class="qna-header">
						<!-- qna-person-info -->
						<div class="qna-person-info">
							<span class="qna-name">{{ qna.name }}</span>
							<span class="qna-location">{{ qna.location }}</span>
						</div>

						<div class="qna-created-info">
							<span>{{ qna.createdAt | moment('HH:mm') }}</span>
						</div>
					</div>

					<!-- .qna-body -->
					<div class="qna-body">
						{{ qna.text }}
					</div>
				</li>
			</ul>
		</div>

		<!-- actions -->
		<section class="qna-block actions" v-if="isUserRegistered">
			<!-- actions-header -->
			<div class="actions-header" v-if="!editingPersonInfo">
				<!-- qna-person-info -->
				<div class="qna-person-info qna-person-info--action">
					<span class="qna-name qna-name--action">{{ personInfo.name }}</span>
					<span class="qna-location qna-location--action">{{ personInfo.country }}</span>
				</div>
			
				<Button type="text" @click="changePersonInfoEditing(true)" class="qna-action-change">Change</Button>
			</div>

			<!-- .actions-body -->
			<div class="actions-body">
				<div class="edit-person-info" v-if="editingPersonInfo">
					<!-- personInfo form -->
					<Form :model="personInfo">
						<FormItem label="Name">
          		<Input v-model="personInfo.name" />
        		</FormItem>

        		<FormItem label="City or Country">
          		<Input v-model="personInfo.country" />
        		</FormItem>

        		<FormItem>
			        <Row type="flex" justify="end">
			        	<Button type="success" @click="updatePersonInfo">Save</Button>
			        </Row>
      			</FormItem>
					</Form>
				</div>

				<!-- new-question -->
				<div class="new-question" v-else>
					<Input v-model="newQuestion" placeholder="Enter something..." :type="newQuestionType" class="new-question--field" @click.native="expandQuestionField(true)" />
					<Button type="primary" class="new-question--submit" @click="createNewQuestion">Send</Button>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
	import {
  	mapState,
  	mapGetters,
  	mapActions
	} from 'vuex'

	import moment from 'moment'

	export default {
		props: ['widget-data'],

		data () {
			return {
				webcastId: this.$store.state.webcast.copy._id,
				newQuestion: '',
				registredData: this.$store.state.registrations.copy.data,
				newQuestionExpanded: false,
				personInfo: {
					name: '',
					country: ''
				},
				editingPersonInfo: false
			}
		},

		computed: {
			...mapGetters('qna', {
      	findQuestionsInStore: 'find',
    	}),

    	...mapGetters('registrations-current', {
      	findRegisteredUser: 'find'
    	}),

    	qnaItems () {
	      return this.findQuestionsInStore().data
    	},

    	registeredUser () {
    		return this.registredData
    	},

    	newQuestionType () {
    		return this.newQuestionExpanded ? 'textarea' : 'text'
    	},

    	isUserRegistered () {
    		return this.registeredUser && !_.isEmpty(this.registeredUser)
    	}
		},

		methods: {
			...mapActions('qna', {
      	questionList: 'find',
      	createQuestionAction: 'create',
      	patchQuestionAction: 'patch'
    	}),

    	getQuestionList(query, page) {
	      query.webcastId = this.webcastId
	      query.isApproved = true

	      this.questionList({
	        query: query
	      }).then((response) => {
	        console.log(response);
	      });
    	},

    	changePersonInfoEditing (isEdit) {
    		this.editingPersonInfo = isEdit
    	},

    	expandQuestionField (isExpanded) {
    		this.newQuestionExpanded = isExpanded
    	},

    	updatePersonInfo () {
    		this.changePersonInfoEditing(false)
    	},

    	setPersonInfo () {
    		if (!_.isEmpty(this.registredData)) {
    			this.personInfo.name = this.registeredUser.name
    			this.personInfo.country = this.registeredUser.country
    		}
    	},

    	scrollToListBottom () {
    		let scrollingElement = document.querySelector('.body')

    		if (scrollingElement) {
					scrollingElement.scrollTop = scrollingElement.scrollHeight;
    		}
    	},

    	createNewQuestion () {
    		let data = {
    			webcastId: this.webcastId,
    			name: this.personInfo.name,
    			location: this.personInfo.country,
    			text: this.newQuestion,
    			bucket: 'inbox',
    			isAnswered: false,
    			isApproved: !this.$store.state.webcast.copy.qnaModeration
    		}

    		if (this.$store.state.webcast.copy.qnaModeration) {
        	data.isApproved = false
	      }

	      if (data.text) {
	      	this.createQuestionAction(data)
	      	.finally(() => {
	      		this.scrollToListBottom()
	      		this.newQuestion = ''
	      		this.newQuestionExpanded = false
	      	})
	      } 
	     }
		},

		created () {
    	this.getQuestionList({})
    	this.setPersonInfo()
  	}
	}
</script>

<style lang="scss" scoped>
	.body {
		overflow: auto;
		padding-right: 20px;
		height: calc(100vh - (86px + 52px));
		&--registered {
			height: calc(100vh - (86px + 52px + 150px));
		}

		&--editing {
			height: calc(100vh - (86px + 52px + 270px));
		}
	}

	.actions {
		border-top: 0.5px solid #e9eaec;
		&-header {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			align-items: center;
			padding: 20px 0;
		}
	}

	.qna {
		&-header {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 15px;
		}

		&-list {
			list-style: none;
			&__item {
				&:not(:last-of-type) {
					margin-bottom: 15px;
				}
			}
		}

		&-action {
			&-change {
				font-size: 14px;
				text-transform: inherit;
				padding: 0;
				color: #337AB7;
				&:focus {
					box-shadow: none;
				}
			}
		}

		&-name {
			color: #367DB8;
			&--action {
				font-weight: bold;
				color: #373C46;
			}
		}

		&-location {
			color: #C8C8C8;
			&--action {
				font-weight: bold;
				color: #777777;
			}
		}
	}

	.new-question {
		display: flex;
		flex-wrap: wrap;
		&--field {
			flex: 1;
		}

		&--submit {
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
			&:focus {
				box-shadow: none;
			}
		}
	}

	.edit-person-info {
		padding-top: 15px;
	}

	@media screen and (max-width: 1250px) {
		.actions-header {
			padding: 10px 0;
		}

		.ivu-input {
			font-size: 11px;
		}

		.body {
			height: calc(100vh - (45vh + 46px + 30px));
			&--registered {
				height: calc(100vh - (45vh + 46px + 30px + 84px));
			}

			&--editing {
				display: none;
				& + .actions {
					border: none;
					.edit-person-info {
						padding-top: 0;
					}
				}
			}

			.qna-list {
				height: 100%;
			}
		}
	}
</style>