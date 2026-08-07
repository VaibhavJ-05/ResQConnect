package com.resqconnect.identitycamp.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "resq.exchange";
    
    public static final String DISASTER_CREATED_QUEUE = "disaster-created-queue";
    public static final String SOS_RAISED_QUEUE = "sos-raised-queue";
    public static final String TASK_ASSIGNED_QUEUE = "task-assignment-queue";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue disasterCreatedQueue() {
        return new Queue(DISASTER_CREATED_QUEUE, true);
    }

    @Bean
    public Queue sosRaisedQueue() {
        return new Queue(SOS_RAISED_QUEUE, true);
    }

    @Bean
    public Queue taskAssignedQueue() {
        return new Queue(TASK_ASSIGNED_QUEUE, true);
    }

    @Bean
    public Binding bindDisasterCreated(Queue disasterCreatedQueue, TopicExchange exchange) {
        return BindingBuilder.bind(disasterCreatedQueue).to(exchange).with("disaster.event.created");
    }

    @Bean
    public Binding bindSosRaised(Queue sosRaisedQueue, TopicExchange exchange) {
        return BindingBuilder.bind(sosRaisedQueue).to(exchange).with("sos.event.raised");
    }

    @Bean
    public Binding bindTaskAssigned(Queue taskAssignedQueue, TopicExchange exchange) {
        return BindingBuilder.bind(taskAssignedQueue).to(exchange).with("task.event.assigned");
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
